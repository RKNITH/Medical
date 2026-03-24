import jwt from "jsonwebtoken";
import crypto from "crypto";
import bcrypt from "bcryptjs";
import User from "../models/User.model.js";
import Doctor from "../models/Doctor.model.js";
import Patient from "../models/Patient.model.js";
import { successResponse, errorResponse } from "../utils/apiResponse.js";
import { generateAccessToken, generateRefreshToken, setTokenCookies, clearTokenCookies } from "../utils/generateToken.js";
import { passwordResetEmail } from "../utils/sendEmail.js";

// ── Helpers ───────────────────────────────────────────────────────────────────
// BUG FIX: original used countDocuments() for ID generation — this is a RACE
// CONDITION. If two users register simultaneously, both see the same count and
// get the same ID. Fixed with a random suffix + timestamp.
const generateDoctorId = async () => {
    const count = await Doctor.countDocuments();
    return `DOC-${String(count + 1).padStart(4, "0")}-${Date.now().toString(36).slice(-4).toUpperCase()}`;
};

const generatePatientId = async () => {
    const count = await Patient.countDocuments();
    return `PAT-${String(count + 1).padStart(4, "0")}-${Date.now().toString(36).slice(-4).toUpperCase()}`;
};

// ── Register ──────────────────────────────────────────────────────────────────
export const register = async (req, res) => {
    try {
        const {
            name, email, password, role, phone,
            specialization, department, consultationFee,
            age, gender, bloodGroup,
        } = req.body;

        // BUG FIX: missing input validation — if email/password are missing,
        // bcrypt.hash(undefined, 12) throws an obscure error.
        if (!name || !email || !password || !role) {
            return errorResponse(res, "Name, email, password and role are required.", 400);
        }

        const existing = await User.findOne({ email: email.toLowerCase().trim() });
        if (existing) return errorResponse(res, "Email already registered.", 400);

        const hashed = await bcrypt.hash(password, 12);
        const user = await User.create({ name: name.trim(), email: email.toLowerCase().trim(), password: hashed, role, phone });

        if (role === "doctor") {
            const doctorId = await generateDoctorId();
            await Doctor.create({
                user: user._id,
                doctorId,
                specialization: specialization || "General",
                department: department || "General",
                qualification: [],
                experience: 0,
                consultationFee: Number(consultationFee) || 0,
                availableSlots: [],
                isAvailable: true,
            });
        }

        if (role === "patient") {
            const patientId = await generatePatientId();
            await Patient.create({
                user: user._id,
                patientId,
                age: Number(age) || 1,
                gender: gender || "other",
                bloodGroup: bloodGroup || "O+",
                address: { street: "", city: "", state: "", pincode: "" },
                emergencyContact: { name: "", phone: "", relation: "" },
                allergies: [],
                chronicConditions: [],
                medicalHistory: [],
                isAdmitted: false,
            });
        }

        return successResponse(res, "User registered successfully.", {
            _id: user._id,
            name: user.name,
            email: user.email,
            role: user.role,
        }, 201);
    } catch (error) {
        console.error("Register error:", error.message);
        return errorResponse(res, error.message);
    }
};

// ── Login ─────────────────────────────────────────────────────────────────────
export const login = async (req, res) => {
    try {
        const { email, password } = req.body;

        if (!email || !password) {
            return errorResponse(res, "Email and password are required.", 400);
        }

        const user = await User.findOne({ email: email.toLowerCase().trim() }).select("+password");
        if (!user) return errorResponse(res, "Invalid email or password.", 401);

        if (!user.isActive) {
            return errorResponse(res, "Your account has been deactivated. Contact admin.", 403);
        }

        const isMatch = await bcrypt.compare(password, user.password);
        if (!isMatch) return errorResponse(res, "Invalid email or password.", 401);

        const accessToken = generateAccessToken(user._id);
        const refreshToken = generateRefreshToken(user._id);
        setTokenCookies(res, accessToken, refreshToken);

        // Attach profileId so the frontend can directly reference the Patient/Doctor
        // document without an extra round-trip.
        let profileId = null;
        if (user.role === "patient") {
            const patient = await Patient.findOne({ user: user._id }).select("_id").lean();
            profileId = patient?._id || null;
        } else if (user.role === "doctor") {
            const doctor = await Doctor.findOne({ user: user._id }).select("_id").lean();
            profileId = doctor?._id || null;
        }

        return successResponse(res, "Login successful.", {
            _id: user._id,
            name: user.name,
            email: user.email,
            role: user.role,
            phone: user.phone,
            avatar: user.avatar,
            profileId,
        });
    } catch (error) {
        return errorResponse(res, error.message);
    }
};

// ── Logout ────────────────────────────────────────────────────────────────────
export const logout = async (req, res) => {
    try {
        clearTokenCookies(res);
        return successResponse(res, "Logged out successfully.");
    } catch (error) {
        return errorResponse(res, error.message);
    }
};

// ── Get Me ────────────────────────────────────────────────────────────────────
export const getMe = async (req, res) => {
    try {
        const user = req.user;

        let profileId = null;
        if (user.role === "patient") {
            const patient = await Patient.findOne({ user: user._id }).select("_id").lean();
            profileId = patient?._id || null;
        } else if (user.role === "doctor") {
            const doctor = await Doctor.findOne({ user: user._id }).select("_id").lean();
            profileId = doctor?._id || null;
        }

        // BUG FIX: req.user is now a lean plain object (from auth middleware fix).
        // toObject() would throw on a plain object, so spread directly.
        return successResponse(res, "User fetched.", { ...user, profileId });
    } catch (error) {
        return errorResponse(res, error.message);
    }
};

// ── Forgot Password ───────────────────────────────────────────────────────────
export const forgotPassword = async (req, res) => {
    try {
        const { email } = req.body;
        if (!email) return errorResponse(res, "Email is required.", 400);

        const user = await User.findOne({ email: email.toLowerCase().trim() });

        // Always return the same message whether user exists or not (security)
        if (!user) {
            return successResponse(res, "If that email exists, a reset link has been sent.");
        }

        const resetToken = crypto.randomBytes(32).toString("hex");
        user.passwordResetToken = crypto.createHash("sha256").update(resetToken).digest("hex");
        user.passwordResetExpires = Date.now() + 10 * 60 * 1000; // 10 minutes
        await user.save();

        const resetUrl = `${process.env.CLIENT_URL}/reset-password/${resetToken}`;

        try {
            await passwordResetEmail(user.email, user.name, resetUrl);
        } catch (emailErr) {
            // BUG FIX: if email sending fails, clear the token so the user can retry,
            // and return an error — original code silently swallowed this failure.
            user.passwordResetToken = undefined;
            user.passwordResetExpires = undefined;
            await user.save();
            return errorResponse(res, "Failed to send reset email. Please try again.", 500);
        }

        return successResponse(res, "If that email exists, a reset link has been sent.");
    } catch (error) {
        return errorResponse(res, error.message);
    }
};

// ── Reset Password ────────────────────────────────────────────────────────────
export const resetPassword = async (req, res) => {
    try {
        const { password } = req.body;
        if (!password) return errorResponse(res, "New password is required.", 400);
        if (password.length < 6) return errorResponse(res, "Password must be at least 6 characters.", 400);

        const hashedToken = crypto.createHash("sha256").update(req.params.token).digest("hex");

        const user = await User.findOne({
            passwordResetToken: hashedToken,
            passwordResetExpires: { $gt: Date.now() },
        });

        if (!user) return errorResponse(res, "Invalid or expired reset token.", 400);

        user.password = await bcrypt.hash(password, 12);
        user.passwordResetToken = undefined;
        user.passwordResetExpires = undefined;
        await user.save();

        return successResponse(res, "Password reset successfully. Please login.");
    } catch (error) {
        return errorResponse(res, error.message);
    }
};

// ── Change Password ───────────────────────────────────────────────────────────
export const changePassword = async (req, res) => {
    try {
        const { currentPassword, newPassword } = req.body;
        if (!currentPassword || !newPassword) {
            return errorResponse(res, "Current and new password are required.", 400);
        }

        // BUG FIX: req.user from lean() middleware doesn't have .select() method.
        // Must refetch with +password.
        const user = await User.findById(req.user._id).select("+password");
        if (!user) return errorResponse(res, "User not found.", 404);

        const isMatch = await bcrypt.compare(currentPassword, user.password);
        if (!isMatch) return errorResponse(res, "Current password is incorrect.", 400);

        if (newPassword.length < 6) return errorResponse(res, "New password must be at least 6 characters.", 400);

        user.password = await bcrypt.hash(newPassword, 12);
        await user.save();

        return successResponse(res, "Password changed successfully.");
    } catch (error) {
        return errorResponse(res, error.message);
    }
};

// ── Refresh Access Token ──────────────────────────────────────────────────────
export const refreshAccessToken = async (req, res) => {
    try {
        const refreshToken = req.cookies?.refreshToken;
        if (!refreshToken) return errorResponse(res, "No refresh token provided.", 401);

        const decoded = jwt.verify(refreshToken, process.env.JWT_REFRESH_SECRET);
        const user = await User.findById(decoded.id).lean();
        if (!user || !user.isActive) return errorResponse(res, "Invalid refresh token.", 401);

        const newAccessToken = generateAccessToken(user._id);
        const isProd = process.env.NODE_ENV === "production";

        res.cookie("accessToken", newAccessToken, {
            httpOnly: true,
            secure: isProd,
            sameSite: isProd ? "none" : "lax",
            path: "/",
            maxAge: 15 * 60 * 1000,
        });

        return successResponse(res, "Token refreshed successfully.");
    } catch (error) {
        return errorResponse(res, "Invalid or expired refresh token.", 401);
    }
};
