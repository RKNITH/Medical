import User from "../models/User.model.js";
import Doctor from "../models/Doctor.model.js";
import Patient from "../models/Patient.model.js";
import { successResponse, errorResponse } from "../utils/apiResponse.js";

// @GET /api/users
export const getAllUsers = async (req, res) => {
    try {
        const { role, isActive, page = 1, limit = 10 } = req.query;
        const pageNum = Math.max(1, parseInt(page, 10));
        const limitNum = Math.min(100, Math.max(1, parseInt(limit, 10)));
        const skip = (pageNum - 1) * limitNum;

        const filter = {};
        if (role) filter.role = role;
        if (isActive !== undefined) filter.isActive = isActive === "true";

        const [total, users] = await Promise.all([
            User.countDocuments(filter),
            User.find(filter).select("-password").skip(skip).limit(limitNum).sort({ createdAt: -1 }).lean(),
        ]);

        return successResponse(res, "Users fetched successfully.", { total, page: pageNum, users });
    } catch (error) {
        return errorResponse(res, error.message);
    }
};

// @GET /api/users/:id
export const getUserById = async (req, res) => {
    try {
        const user = await User.findById(req.params.id).select("-password").lean();
        if (!user) return errorResponse(res, "User not found.", 404);
        return successResponse(res, "User fetched successfully.", user);
    } catch (error) {
        return errorResponse(res, error.message);
    }
};

// @PUT /api/users/:id
export const updateUser = async (req, res) => {
    try {
        // BUG FIX: whitelist only safe fields; role/isActive must not be changeable here
        const { name, phone } = req.body;

        const user = await User.findByIdAndUpdate(
            req.params.id,
            { name, phone },
            { new: true, runValidators: true }
        ).select("-password").lean();

        if (!user) return errorResponse(res, "User not found.", 404);
        return successResponse(res, "User updated successfully.", user);
    } catch (error) {
        return errorResponse(res, error.message);
    }
};

// @PUT /api/users/:id/toggle-status
export const toggleUserStatus = async (req, res) => {
    try {
        const user = await User.findById(req.params.id);
        if (!user) return errorResponse(res, "User not found.", 404);

        // BUG FIX: prevent admin from deactivating themselves
        if (user._id.toString() === req.user._id.toString()) {
            return errorResponse(res, "You cannot deactivate your own account.", 400);
        }

        user.isActive = !user.isActive;
        await user.save();

        return successResponse(res, `User ${user.isActive ? "activated" : "deactivated"} successfully.`, {
            _id: user._id,
            isActive: user.isActive,
        });
    } catch (error) {
        return errorResponse(res, error.message);
    }
};

// @PUT /api/users/avatar  (uses authenticated user's own ID)
export const updateAvatar = async (req, res) => {
    try {
        if (!req.file) return errorResponse(res, "No file uploaded.", 400);

        // BUG FIX: use req.user._id (from auth middleware), not req.params.id
        // Route is /users/avatar (no :id param) — always operates on self
        const user = await User.findByIdAndUpdate(
            req.user._id,
            { avatar: req.file.path },
            { new: true }
        ).select("-password").lean();

        if (!user) return errorResponse(res, "User not found.", 404);
        return successResponse(res, "Avatar updated successfully.", user);
    } catch (error) {
        return errorResponse(res, error.message);
    }
};
