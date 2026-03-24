import Patient from "../models/Patient.model.js";
import User from "../models/User.model.js";
import Appointment from "../models/Appointment.model.js";
import bcrypt from "bcryptjs";
import { successResponse, errorResponse } from "../utils/apiResponse.js";

const generatePatientId = () => `PAT-${Date.now().toString().slice(-6)}-${Math.random().toString(36).slice(-3).toUpperCase()}`;

// @POST /api/patients
export const createPatient = async (req, res) => {
    try {
        const { name, email, password, phone, age, gender, bloodGroup, address, emergencyContact, allergies, chronicConditions } = req.body;

        if (!name || !email || !password) {
            return errorResponse(res, "Name, email and password are required.", 400);
        }

        const existingUser = await User.findOne({ email: email.toLowerCase().trim() }).lean();
        if (existingUser) return errorResponse(res, "Email already registered.", 400);

        const hashedPassword = await bcrypt.hash(password, 12);
        const user = await User.create({ name: name.trim(), email: email.toLowerCase().trim(), password: hashedPassword, role: "patient", phone });

        const patient = await Patient.create({
            user: user._id,
            patientId: generatePatientId(),
            age,
            gender,
            bloodGroup,
            address,
            emergencyContact,
            allergies,
            chronicConditions,
        });

        return successResponse(res, "Patient registered successfully.", patient, 201);
    } catch (error) {
        return errorResponse(res, error.message);
    }
};

// @GET /api/patients
export const getAllPatients = async (req, res) => {
    try {
        const { search, page = 1, limit = 10 } = req.query;
        const pageNum = Math.max(1, parseInt(page, 10));
        const limitNum = Math.min(100, Math.max(1, parseInt(limit, 10)));
        const skip = (pageNum - 1) * limitNum;

        // BUG FIX: original used populate({ match }) for search, which loads ALL
        // patients and then filters in memory — O(n) memory + slow at scale.
        // Fixed: search on the User collection first, then join.
        let patientQuery = {};
        if (search) {
            const matchingUsers = await User.find({
                name: { $regex: search, $options: "i" },
                role: "patient",
            }).select("_id").lean();
            patientQuery.user = { $in: matchingUsers.map(u => u._id) };
        }

        const [total, patients] = await Promise.all([
            Patient.countDocuments(patientQuery),
            Patient.find(patientQuery)
                .populate({ path: "user", select: "name email phone avatar" })
                .skip(skip)
                .limit(limitNum)
                .sort({ createdAt: -1 })
                .lean(),
        ]);

        return successResponse(res, "Patients fetched successfully.", { total, page: pageNum, patients });
    } catch (error) {
        return errorResponse(res, error.message);
    }
};

// @GET /api/patients/me
export const getMyPatientProfile = async (req, res) => {
    try {
        const patient = await Patient.findOne({ user: req.user._id })
            .populate("user", "name email phone avatar")
            .populate("assignedBed")
            .lean();

        if (!patient) return errorResponse(res, "Patient profile not found.", 404);
        return successResponse(res, "Patient profile fetched.", patient);
    } catch (error) {
        return errorResponse(res, error.message);
    }
};

// @GET /api/patients/:id
export const getPatientById = async (req, res) => {
    try {
        const patient = await Patient.findById(req.params.id)
            .populate("user", "-password")
            .populate("assignedBed")
            .lean();

        if (!patient) return errorResponse(res, "Patient not found.", 404);
        return successResponse(res, "Patient fetched successfully.", patient);
    } catch (error) {
        return errorResponse(res, error.message);
    }
};

// @PUT /api/patients/:id
export const updatePatient = async (req, res) => {
    try {
        const { age, gender, bloodGroup, address, emergencyContact, allergies, chronicConditions, isAdmitted, assignedBed } = req.body;

        if (req.user.role === "patient") {
            const own = await Patient.findOne({ user: req.user._id }).select("_id").lean();
            if (!own || own._id.toString() !== req.params.id) {
                return errorResponse(res, "Access denied.", 403);
            }
        }

        const updateFields = { age, gender, bloodGroup, address, emergencyContact, allergies, chronicConditions };

        if (["super_admin", "admin", "nurse", "receptionist"].includes(req.user.role)) {
            if (isAdmitted !== undefined) updateFields.isAdmitted = isAdmitted;
            if (assignedBed !== undefined) updateFields.assignedBed = assignedBed;
        }

        const patient = await Patient.findByIdAndUpdate(
            req.params.id,
            updateFields,
            { new: true, runValidators: true }
        )
            .populate("user", "-password")
            .populate("assignedBed")
            .lean();

        if (!patient) return errorResponse(res, "Patient not found.", 404);
        return successResponse(res, "Patient updated successfully.", patient);
    } catch (error) {
        return errorResponse(res, error.message);
    }
};

// @POST /api/patients/:id/medical-history
export const addMedicalHistory = async (req, res) => {
    try {
        const { condition, treatedAt, notes } = req.body;
        if (!condition) return errorResponse(res, "Condition is required.", 400);

        const patient = await Patient.findByIdAndUpdate(
            req.params.id,
            { $push: { medicalHistory: { condition, treatedAt, notes } } },
            { new: true }
        ).lean();

        if (!patient) return errorResponse(res, "Patient not found.", 404);
        return successResponse(res, "Medical history added successfully.", patient);
    } catch (error) {
        return errorResponse(res, error.message);
    }
};

// @DELETE /api/patients/:id
export const deletePatient = async (req, res) => {
    try {
        const patient = await Patient.findById(req.params.id).lean();
        if (!patient) return errorResponse(res, "Patient not found.", 404);

        // BUG FIX: run both deletes in parallel
        await Promise.all([
            User.findByIdAndDelete(patient.user),
            Patient.findByIdAndDelete(req.params.id),
        ]);

        return successResponse(res, "Patient deleted successfully.");
    } catch (error) {
        return errorResponse(res, error.message);
    }
};
