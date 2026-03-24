import Appointment from "../models/Appointment.model.js";
import Doctor from "../models/Doctor.model.js";
import Patient from "../models/Patient.model.js";
import { successResponse, errorResponse } from "../utils/apiResponse.js";
import { sendEmail, appointmentConfirmationEmail } from "../utils/sendEmail.js";

// @POST /api/appointments
export const createAppointment = async (req, res) => {
    try {
        const { patient, doctor, appointmentDate, timeSlot, type, reason } = req.body;

        if (!patient || !doctor || !appointmentDate || !timeSlot) {
            return errorResponse(res, "patient, doctor, appointmentDate and timeSlot are required.", 400);
        }

        // BUG FIX: date comparison needs to be exact. Storing appointmentDate as a
        // plain string means the $eq check may miss timezone-shifted values.
        // Normalise to Date object before querying.
        const apptDate = new Date(appointmentDate);
        if (isNaN(apptDate)) return errorResponse(res, "Invalid appointmentDate.", 400);

        const conflict = await Appointment.findOne({
            doctor,
            appointmentDate: apptDate,
            timeSlot,
            status: { $in: ["scheduled", "in_progress"] },
        }).lean();
        if (conflict) return errorResponse(res, "This time slot is already booked.", 400);

        const appointment = await Appointment.create({
            patient, doctor, appointmentDate: apptDate, timeSlot, type, reason,
        });

        // OPTIMIZATION: single populate call (was two separate awaits)
        const populated = await Appointment.findById(appointment._id)
            .populate({ path: "patient", populate: { path: "user", select: "name email" } })
            .populate({ path: "doctor", populate: { path: "user", select: "name" } })
            .lean();

        const patientEmail = populated.patient?.user?.email;
        const patientName = populated.patient?.user?.name;
        const doctorName = populated.doctor?.user?.name;
        const dateStr = apptDate.toDateString();

        // Email — fire-and-forget, never blocks the response
        if (patientEmail) {
            sendEmail({
                to: patientEmail,
                subject: "MediCore — Appointment Confirmed",
                html: appointmentConfirmationEmail(patientName, doctorName, dateStr, timeSlot),
            }).catch((err) => console.error("Appointment email failed:", err.message));
        }

        // BUG FIX: original used io.emit() (broadcast to ALL sockets) for targeted
        // role notifications. Should use io.to(room) so only relevant roles get it.
        req.io.to("doctor").emit("appointment_changed", {
            message: `New appointment: ${patientName} on ${dateStr} at ${timeSlot}`,
            type: "success",
        });
        req.io.to("receptionist").emit("appointment_changed", {
            message: `New appointment — ${patientName} with Dr. ${doctorName}`,
            type: "info",
        });
        req.io.to("admin").emit("appointment_changed", {
            message: `New appointment: ${patientName} with Dr. ${doctorName} on ${dateStr}`,
            type: "info",
        });

        return successResponse(res, "Appointment booked successfully.", populated, 201);
    } catch (error) {
        return errorResponse(res, error.message);
    }
};

// @GET /api/appointments
export const getAllAppointments = async (req, res) => {
    try {
        const { status, type, date, page = 1, limit = 10 } = req.query;
        const pageNum = Math.max(1, parseInt(page, 10));
        const limitNum = Math.min(100, Math.max(1, parseInt(limit, 10))); // cap at 100
        const skip = (pageNum - 1) * limitNum;

        const filter = {};
        if (status) filter.status = status;
        if (type) filter.type = type;
        if (date) {
            const start = new Date(date);
            start.setHours(0, 0, 0, 0);
            const end = new Date(date);
            end.setHours(23, 59, 59, 999);
            filter.appointmentDate = { $gte: start, $lte: end };
        }

        // OPTIMIZATION: run count and find in parallel
        const [total, appointments] = await Promise.all([
            Appointment.countDocuments(filter),
            Appointment.find(filter)
                .populate({ path: "patient", populate: { path: "user", select: "name email phone" } })
                .populate({ path: "doctor", populate: { path: "user", select: "name" } })
                .skip(skip)
                .limit(limitNum)
                .sort({ appointmentDate: -1 })
                .lean(),
        ]);

        return successResponse(res, "Appointments fetched successfully.", {
            total, page: pageNum, limit: limitNum, appointments,
        });
    } catch (error) {
        return errorResponse(res, error.message);
    }
};

// @GET /api/appointments/:id
export const getAppointmentById = async (req, res) => {
    try {
        const appointment = await Appointment.findById(req.params.id)
            .populate({ path: "patient", populate: { path: "user", select: "name email phone" } })
            .populate({ path: "doctor", populate: { path: "user", select: "name" } })
            .lean();

        if (!appointment) return errorResponse(res, "Appointment not found.", 404);
        return successResponse(res, "Appointment fetched successfully.", appointment);
    } catch (error) {
        return errorResponse(res, error.message);
    }
};

// @GET /api/appointments/doctor/:doctorId
export const getDoctorAppointments = async (req, res) => {
    try {
        const { date, status } = req.query;
        const filter = { doctor: req.params.doctorId };
        if (status) filter.status = status;
        if (date) {
            const start = new Date(date);
            start.setHours(0, 0, 0, 0);
            const end = new Date(date);
            end.setHours(23, 59, 59, 999);
            filter.appointmentDate = { $gte: start, $lte: end };
        }

        const appointments = await Appointment.find(filter)
            .populate({ path: "patient", populate: { path: "user", select: "name email phone" } })
            .sort({ appointmentDate: 1 })
            .lean();

        return successResponse(res, "Doctor appointments fetched successfully.", appointments);
    } catch (error) {
        return errorResponse(res, error.message);
    }
};

// @GET /api/appointments/patient/:patientId
export const getPatientAppointments = async (req, res) => {
    try {
        const appointments = await Appointment.find({ patient: req.params.patientId })
            .populate({ path: "doctor", populate: { path: "user", select: "name" } })
            .sort({ appointmentDate: -1 })
            .lean();

        return successResponse(res, "Patient appointments fetched successfully.", appointments);
    } catch (error) {
        return errorResponse(res, error.message);
    }
};

// @PUT /api/appointments/:id/status
export const updateAppointmentStatus = async (req, res) => {
    try {
        const { status } = req.body;

        // BUG FIX: no validation on allowed status values — anyone could set
        // status to an arbitrary string and corrupt the data.
        const allowedStatuses = ["scheduled", "in_progress", "completed", "cancelled", "no_show"];
        if (!status || !allowedStatuses.includes(status)) {
            return errorResponse(res, `Status must be one of: ${allowedStatuses.join(", ")}`, 400);
        }

        const appointment = await Appointment.findByIdAndUpdate(
            req.params.id,
            { status },
            { new: true }
        )
            .populate({ path: "patient", populate: { path: "user", select: "name email" } })
            .populate({ path: "doctor", populate: { path: "user", select: "name" } })
            .lean();

        if (!appointment) return errorResponse(res, "Appointment not found.", 404);

        req.io.to("patient").emit("appointment_changed", {
            message: `Your appointment with Dr. ${appointment.doctor?.user?.name} is now ${status.replace(/_/g, " ")}`,
            type: status === "completed" ? "success" : "info",
        });
        req.io.to("receptionist").emit("appointment_changed", {
            message: `Appointment for ${appointment.patient?.user?.name} updated to ${status.replace(/_/g, " ")}`,
            type: "info",
        });

        return successResponse(res, "Appointment status updated.", appointment);
    } catch (error) {
        return errorResponse(res, error.message);
    }
};

// @PUT /api/appointments/:id/cancel
export const cancelAppointment = async (req, res) => {
    try {
        const { cancelReason } = req.body;

        const appointment = await Appointment.findByIdAndUpdate(
            req.params.id,
            { status: "cancelled", cancelledBy: req.user._id, cancelReason },
            { new: true }
        )
            .populate({ path: "patient", populate: { path: "user", select: "name" } })
            .populate({ path: "doctor", populate: { path: "user", select: "name" } })
            .lean();

        if (!appointment) return errorResponse(res, "Appointment not found.", 404);

        req.io.to("patient").emit("appointment_changed", {
            message: `Your appointment with Dr. ${appointment.doctor?.user?.name} has been cancelled.`,
            type: "error",
        });
        req.io.to("doctor").emit("appointment_changed", {
            message: `Appointment with ${appointment.patient?.user?.name} has been cancelled.`,
            type: "error",
        });

        return successResponse(res, "Appointment cancelled successfully.", appointment);
    } catch (error) {
        return errorResponse(res, error.message);
    }
};
