import { errorResponse } from "../utils/apiResponse.js";

// Usage: authorize("admin", "doctor")
export const authorize = (...allowedRoles) => {
    return (req, res, next) => {
        if (!req.user) {
            return errorResponse(res, "Unauthorized. Please login.", 401);
        }

        if (!allowedRoles.includes(req.user.role)) {
            return errorResponse(
                res,
                `Access denied. Only [${allowedRoles.join(", ")}] can perform this action.`,
                403
            );
        }

        next();
    };
};

// Usage: authorizeSelf() — user can only access their own resource
export const authorizeSelf = (paramKey = "id") => {
    return (req, res, next) => {
        if (!req.user) {
            return errorResponse(res, "Unauthorized. Please login.", 401);
        }

        const isSelf = req.user._id.toString() === req.params[paramKey];
        const isAdminOrAbove = ["super_admin", "admin"].includes(req.user.role);

        if (!isSelf && !isAdminOrAbove) {
            return errorResponse(res, "Access denied. You can only access your own data.", 403);
        }

        next();
    };
};