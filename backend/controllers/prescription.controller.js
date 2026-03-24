import Prescription from "../models/Prescription.model.js";
import Doctor from "../models/Doctor.model.js";
import Patient from "../models/Patient.model.js";
import { successResponse, errorResponse } from "../utils/apiResponse.js";
import { generatePrescriptionPDF } from "../utils/generatePDF.js";

// @POST /api/prescriptions
export const createPrescription = async (req, res) => {
    try {
        const { appointment, patient, diagnosis, medicines, notes, followUpDate } = req.body;

        if (!patient || !diagnosis || !medicines?.length) {
            return errorResponse(res, "patient, diagnosis and medicines are required.", 400);
        }

        // resolve Doctor._id from logged-in user (server-side, can't be spoofed)
        const doctorProfile = await Doctor.findOne({ user: req.user._id }).select("_id").lean();
        if (!doctorProfile) return errorResponse(res, "Doctor profile not found.", 404);

        const prescription = await Prescription.create({
            appointment,
            patient,
            doctor: doctorProfile._id,
            diagnosis,
            medicines,
            notes,
            followUpDate,
        });

        // OPTIMIZATION: lean() on the populate read
        const populated = await Prescription.findById(prescription._id)
            .populate({ path: "patient", populate: { path: "user", select: "name" } })
            .populate({ path: "doctor", populate: { path: "user", select: "name" } })
            .populate("appointment")
            .lean();

        return successResponse(res, "Prescription created successfully.", populated, 201);
    } catch (error) {
        return errorResponse(res, error.message);
    }
};

// @GET /api/prescriptions/patient/:patientId
export const getPatientPrescriptions = async (req, res) => {
    try {
        // patient can only access their own prescriptions
        if (req.user.role === "patient") {
            const own = await Patient.findOne({ user: req.user._id }).select("_id").lean();
            if (!own || own._id.toString() !== req.params.patientId) {
                return errorResponse(res, "Access denied.", 403);
            }
        }

        const prescriptions = await Prescription.find({ patient: req.params.patientId })
            .populate({ path: "doctor", populate: { path: "user", select: "name" } })
            .populate("appointment")
            .sort({ createdAt: -1 })
            .lean();

        return successResponse(res, "Prescriptions fetched successfully.", prescriptions);
    } catch (error) {
        return errorResponse(res, error.message);
    }
};

// @GET /api/prescriptions/doctor/:doctorId
export const getDoctorPrescriptions = async (req, res) => {
    try {
        const prescriptions = await Prescription.find({ doctor: req.params.doctorId })
            .populate({ path: "patient", populate: { path: "user", select: "name" } })
            .populate("appointment")
            .sort({ createdAt: -1 })
            .lean();

        return successResponse(res, "Doctor prescriptions fetched successfully.", prescriptions);
    } catch (error) {
        return errorResponse(res, error.message);
    }
};

// @GET /api/prescriptions/:id
export const getPrescriptionById = async (req, res) => {
    try {
        const prescription = await Prescription.findById(req.params.id)
            .populate({ path: "patient", populate: { path: "user", select: "name" } })
            .populate({ path: "doctor", populate: { path: "user", select: "name" } })
            .populate("appointment")
            .lean();

        if (!prescription) return errorResponse(res, "Prescription not found.", 404);
        return successResponse(res, "Prescription fetched successfully.", prescription);
    } catch (error) {
        return errorResponse(res, error.message);
    }
};

// @PUT /api/prescriptions/:id
export const updatePrescription = async (req, res) => {
    try {
        const { diagnosis, medicines, notes, followUpDate } = req.body;

        // BUG FIX: no check that the requesting doctor owns this prescription.
        // Any authenticated doctor could update another doctor's prescription.
        const doctorProfile = await Doctor.findOne({ user: req.user._id }).select("_id").lean();

        const existing = await Prescription.findById(req.params.id).lean();
        if (!existing) return errorResponse(res, "Prescription not found.", 404);

        // Only the owning doctor or admin can update
        if (doctorProfile && existing.doctor.toString() !== doctorProfile._id.toString()) {
            if (!["super_admin", "admin"].includes(req.user.role)) {
                return errorResponse(res, "Access denied. You can only edit your own prescriptions.", 403);
            }
        }

        const prescription = await Prescription.findByIdAndUpdate(
            req.params.id,
            { diagnosis, medicines, notes, followUpDate },
            { new: true, runValidators: true }
        ).lean();

        return successResponse(res, "Prescription updated successfully.", prescription);
    } catch (error) {
        return errorResponse(res, error.message);
    }
};

// @GET /api/prescriptions/:id/pdf
export const downloadPrescriptionPDF = async (req, res) => {
    try {
        const prescription = await Prescription.findById(req.params.id)
            .populate({ path: "patient", populate: { path: "user", select: "name" } })
            .populate({ path: "doctor", populate: { path: "user", select: "name specialization" } })
            .lean();

        if (!prescription) return errorResponse(res, "Prescription not found.", 404);

        const data = {
            patient: {
                name: prescription.patient?.user?.name,
                age: prescription.patient?.age,
                gender: prescription.patient?.gender,
            },
            doctor: {
                name: prescription.doctor?.user?.name,
                specialization: prescription.doctor?.specialization,
            },
            medicines: prescription.medicines,
            diagnosis: prescription.diagnosis,
            notes: prescription.notes,
            date: new Date(prescription.createdAt).toDateString(),
        };

        generatePrescriptionPDF(res, data);
    } catch (error) {
        return errorResponse(res, error.message);
    }
};
