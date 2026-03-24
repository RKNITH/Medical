import jwt from "jsonwebtoken";
import { errorResponse } from "../utils/apiResponse.js";
import User from "../models/User.model.js";

export const verifyToken = async (req, res, next) => {
    try {
        // get token from cookie OR Authorization header
        const token =
            req.cookies?.accessToken ||
            req.headers?.authorization?.replace("Bearer ", "").trim();

        if (!token) {
            return errorResponse(res, "Access denied. No token provided.", 401);
        }

        const decoded = jwt.verify(token, process.env.JWT_ACCESS_SECRET);

        // OPTIMIZATION: use lean() — returns plain JS object, ~2× faster than
        // full Mongoose document. We only need to read user data here, not save.
        // BUG FIX: original did .select("-password") but User schema already has
        // select: false on password, so this was redundant. Kept for safety.
        const user = await User.findById(decoded.id).select("-password").lean();

        if (!user) return errorResponse(res, "User not found.", 401);
        if (!user.isActive) return errorResponse(res, "Account is deactivated.", 403);

        req.user = user;
        next();
    } catch (error) {
        if (error.name === "TokenExpiredError") {
            return errorResponse(res, "Token expired.", 401);
        }
        if (error.name === "JsonWebTokenError") {
            return errorResponse(res, "Invalid token.", 401);
        }
        return errorResponse(res, "Authentication error.", 401);
    }
};

export const refreshAccessToken = async (req, res, next) => {
    try {
        const token = req.cookies?.refreshToken;
        if (!token) return errorResponse(res, "No refresh token.", 401);

        const decoded = jwt.verify(token, process.env.JWT_REFRESH_SECRET);
        const user = await User.findById(decoded.id).select("-password").lean();
        if (!user) return errorResponse(res, "User not found.", 401);
        if (!user.isActive) return errorResponse(res, "Account is deactivated.", 403);

        req.user = user;
        next();
    } catch (error) {
        return errorResponse(res, "Invalid refresh token.", 401);
    }
};
