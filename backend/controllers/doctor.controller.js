import Doctor from "../models/Doctor.model.js";
import User from "../models/User.model.js";
import bcrypt from "bcryptjs";
import { successResponse, errorResponse } from "../utils/apiResponse.js";

// BUG FIX: same race-condition ID issue as patient — add random suffix
const generateDoctorId = () =>
    `DOC-${Date.now().toString().slice(-6)}-${Math.random().toString(36).slice(-3).toUpperCase()}`;

// @POST /api/doctors
export const createDoctor = async (req, res) => {
    try {
        const { name, email, password, phone, specialization, department, qualification, experience, consultationFee, availableSlots } = req.body;

        if (!name || !email || !password) {
            return errorResponse(res, "name, email and password are required.", 400);
        }

        const existingUser = await User.findOne({ email: email.toLowerCase().trim() }).lean();
        if (existingUser) return errorResponse(res, "Email already registered.", 400);

        const hashedPassword = await bcrypt.hash(password, 12);
        const user = await User.create({ name: name.trim(), email: email.toLowerCase().trim(), password: hashedPassword, role: "doctor", phone });

        const doctor = await Doctor.create({
            user: user._id,
            doctorId: generateDoctorId(),
            specialization,
            department,
            qualification,
            experience,
            consultationFee,
            availableSlots,
        });

        return successResponse(res, "Doctor created successfully.", doctor, 201);
    } catch (error) {
        return errorResponse(res, error.message);
    }
};

// @GET /api/doctors
export const getAllDoctors = async (req, res) => {
    try {
        const { department, specialization, isAvailable, page = 1, limit = 10 } = req.query;
        const pageNum = Math.max(1, parseInt(page, 10));
        const limitNum = Math.min(100, Math.max(1, parseInt(limit, 10)));
        const skip = (pageNum - 1) * limitNum;

        const filter = {};
        if (department) filter.department = department;
        if (specialization) filter.specialization = { $regex: specialization, $options: "i" };
        if (isAvailable !== undefined) filter.isAvailable = isAvailable === "true";

        const [total, doctors] = await Promise.all([
            Doctor.countDocuments(filter),
            Doctor.find(filter)
                .populate("user", "-password")
                .skip(skip)
                .limit(limitNum)
                .sort({ createdAt: -1 })
                .lean(),
        ]);

        return successResponse(res, "Doctors fetched successfully.", { total, page: pageNum, doctors });
    } catch (error) {
        return errorResponse(res, error.message);
    }
};

// @GET /api/doctors/:id
export const getDoctorById = async (req, res) => {
    try {
        const doctor = await Doctor.findById(req.params.id).populate("user", "-password").lean();
        if (!doctor) return errorResponse(res, "Doctor not found.", 404);
        return successResponse(res, "Doctor fetched successfully.", doctor);
    } catch (error) {
        return errorResponse(res, error.message);
    }
};

// @PUT /api/doctors/:id
export const updateDoctor = async (req, res) => {
    try {
        const { specialization, department, qualification, experience, consultationFee, availableSlots, isAvailable } = req.body;

        const doctor = await Doctor.findByIdAndUpdate(
            req.params.id,
            { specialization, department, qualification, experience, consultationFee, availableSlots, isAvailable },
            { new: true, runValidators: true }
        ).populate("user", "-password").lean();

        if (!doctor) return errorResponse(res, "Doctor not found.", 404);
        return successResponse(res, "Doctor updated successfully.", doctor);
    } catch (error) {
        return errorResponse(res, error.message);
    }
};

// @DELETE /api/doctors/:id
export const deleteDoctor = async (req, res) => {
    try {
        const doctor = await Doctor.findById(req.params.id).lean();
        if (!doctor) return errorResponse(res, "Doctor not found.", 404);

        await Promise.all([
            User.findByIdAndDelete(doctor.user),
            Doctor.findByIdAndDelete(req.params.id),
        ]);

        return successResponse(res, "Doctor deleted successfully.");
    } catch (error) {
        return errorResponse(res, error.message);
    }
};

// @GET /api/doctors/me
export const getMyDoctorProfile = async (req, res) => {
    try {
        const doctor = await Doctor.findOne({ user: req.user._id }).populate("user", "-password").lean();
        if (!doctor) return errorResponse(res, "Doctor profile not found.", 404);
        return successResponse(res, "Doctor profile fetched.", doctor);
    } catch (error) {
        return errorResponse(res, error.message);
    }
};
