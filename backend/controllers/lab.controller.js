import LabTest from "../models/LabTest.model.js";
import Doctor from "../models/Doctor.model.js";
import Patient from "../models/Patient.model.js";
import { successResponse, errorResponse } from "../utils/apiResponse.js";
import { sendEmail, labReportReadyEmail } from "../utils/sendEmail.js";

const ALLOWED_LAB_STATUSES = ["pending", "sample_collected", "in_progress", "completed", "cancelled"];

// @POST /api/lab
export const createLabTest = async (req, res) => {
    try {
        const { patient, testName, testCode, price, notes } = req.body;

        if (!patient || !testName) {
            return errorResponse(res, "patient and testName are required.", 400);
        }

        const doctorProfile = await Doctor.findOne({ user: req.user._id }).select("_id").lean();
        if (!doctorProfile && !["super_admin", "admin"].includes(req.user.role)) {
            return errorResponse(res, "Doctor profile not found.", 404);
        }

        // admin can pass doctor explicitly, doctor uses own profile
        const doctorId = doctorProfile?._id || req.body.doctor;

        const labTest = await LabTest.create({
            patient,
            doctor: doctorId,
            testName,
            testCode,
            price,
            notes,
        });

        const populated = await LabTest.findById(labTest._id)
            .populate({ path: "patient", populate: { path: "user", select: "name" } })
            .populate({ path: "doctor", populate: { path: "user", select: "name" } })
            .lean();

        // notify lab technicians and admin (targeted, not broadcast)
        req.io.to("lab_technician").emit("lab_order_new", {
            message: `New lab order: ${testName} for ${populated.patient?.user?.name}`,
            type: "info",
        });
        req.io.to("admin").emit("lab_order_new", {
            message: `New lab order: ${testName} for ${populated.patient?.user?.name}`,
            type: "info",
        });

        return successResponse(res, "Lab test created successfully.", populated, 201);
    } catch (error) {
        return errorResponse(res, error.message);
    }
};

// @GET /api/lab
export const getAllLabTests = async (req, res) => {
    try {
        const { status, doctor, patient, page = 1, limit = 10 } = req.query;
        const pageNum = Math.max(1, parseInt(page, 10));
        const limitNum = Math.min(100, Math.max(1, parseInt(limit, 10)));
        const skip = (pageNum - 1) * limitNum;

        const filter = {};
        if (status) filter.status = status;
        if (doctor) filter.doctor = doctor;
        if (patient) filter.patient = patient;

        // OPTIMIZATION: parallel count + find
        const [total, tests] = await Promise.all([
            LabTest.countDocuments(filter),
            LabTest.find(filter)
                .populate({ path: "patient", populate: { path: "user", select: "name" } })
                .populate({ path: "doctor", populate: { path: "user", select: "name" } })
                .skip(skip)
                .limit(limitNum)
                .sort({ createdAt: -1 })
                .lean(),
        ]);

        return successResponse(res, "Lab tests fetched successfully.", { total, page: pageNum, tests });
    } catch (error) {
        return errorResponse(res, error.message);
    }
};

// @GET /api/lab/:id
export const getLabTestById = async (req, res) => {
    try {
        const test = await LabTest.findById(req.params.id)
            .populate({ path: "patient", populate: { path: "user", select: "name email phone" } })
            .populate({ path: "doctor", populate: { path: "user", select: "name" } })
            .populate("processedBy", "name role")
            .lean();

        if (!test) return errorResponse(res, "Lab test not found.", 404);
        return successResponse(res, "Lab test fetched successfully.", test);
    } catch (error) {
        return errorResponse(res, error.message);
    }
};

// @GET /api/lab/patient/:patientId
export const getPatientLabTests = async (req, res) => {
    try {
        if (req.user.role === "patient") {
            const own = await Patient.findOne({ user: req.user._id }).select("_id").lean();
            if (!own || own._id.toString() !== req.params.patientId) {
                return errorResponse(res, "Access denied.", 403);
            }
        }

        const tests = await LabTest.find({ patient: req.params.patientId })
            .populate({ path: "doctor", populate: { path: "user", select: "name" } })
            .sort({ createdAt: -1 })
            .lean();

        return successResponse(res, "Patient lab tests fetched successfully.", tests);
    } catch (error) {
        return errorResponse(res, error.message);
    }
};

// @PUT /api/lab/:id/status
export const updateLabStatus = async (req, res) => {
    try {
        const { status } = req.body;

        // BUG FIX: no validation of allowed statuses
        if (!status || !ALLOWED_LAB_STATUSES.includes(status)) {
            return errorResponse(res, `status must be one of: ${ALLOWED_LAB_STATUSES.join(", ")}`, 400);
        }

        const updateData = { status, processedBy: req.user._id };
        if (status === "sample_collected") updateData.collectedAt = new Date();
        if (status === "completed") updateData.completedAt = new Date();

        const test = await LabTest.findByIdAndUpdate(req.params.id, updateData, { new: true })
            .populate({ path: "patient", populate: { path: "user", select: "name" } })
            .populate({ path: "doctor", populate: { path: "user", select: "name" } })
            .lean();

        if (!test) return errorResponse(res, "Lab test not found.", 404);

        req.io.to("doctor").emit("lab_status_changed", {
            message: `Lab test "${test.testName}" for ${test.patient?.user?.name} is now ${status.replace(/_/g, " ")}`,
            type: "info",
        });

        return successResponse(res, "Lab test status updated.", test);
    } catch (error) {
        return errorResponse(res, error.message);
    }
};

// @PUT /api/lab/:id/result
export const uploadLabResult = async (req, res) => {
    try {
        const { result, notes } = req.body;
        const reportUrl = req.file ? req.file.path : null;

        const test = await LabTest.findByIdAndUpdate(
            req.params.id,
            {
                result,
                notes,
                reportUrl,
                status: "completed",
                completedAt: new Date(),
                processedBy: req.user._id,
            },
            { new: true }
        )
            .populate({ path: "patient", populate: { path: "user", select: "name email phone" } })
            .populate({ path: "doctor", populate: { path: "user", select: "name" } })
            .populate("processedBy", "name role")
            .lean();

        if (!test) return errorResponse(res, "Lab test not found.", 404);

        const patientName = test.patient?.user?.name;
        const testName = test.testName;

        // Targeted socket notifications
        req.io.to("patient").emit("lab_result_ready", {
            message: `Your lab result for "${testName}" is ready.`,
            type: "success",
        });
        req.io.to("doctor").emit("lab_result_ready", {
            message: `Lab result for "${testName}" (${patientName}) has been uploaded.`,
            type: "success",
        });
        req.io.to("admin").emit("lab_result_ready", {
            message: `Lab result uploaded: "${testName}" for ${patientName}`,
            type: "info",
        });

        // Email — fire-and-forget
        if (test.patient?.user?.email) {
            sendEmail({
                to: test.patient.user.email,
                subject: "MediCore — Lab Report Ready",
                html: labReportReadyEmail(patientName, testName),
            }).catch((err) => console.error("Lab report email failed:", err.message));
        }

        return successResponse(res, "Lab result uploaded successfully.", test);
    } catch (error) {
        return errorResponse(res, error.message);
    }
};

// @DELETE /api/lab/:id
export const deleteLabTest = async (req, res) => {
    try {
        const test = await LabTest.findByIdAndDelete(req.params.id).lean();
        if (!test) return errorResponse(res, "Lab test not found.", 404);
        return successResponse(res, "Lab test deleted successfully.");
    } catch (error) {
        return errorResponse(res, error.message);
    }
};
