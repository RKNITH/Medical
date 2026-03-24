import express from "express";
import {
    getAllUsers,
    getUserById,
    updateUser,
    updateAvatar,
    toggleUserStatus,

} from "../controllers/user.controller.js";
import { verifyToken } from "../middleware/auth.middleware.js";
import { authorize, authorizeSelf } from "../middleware/role.middleware.js";
import { uploadProfile, handleMulterError } from "../middleware/upload.middleware.js";

const router = express.Router();

router.get("/", verifyToken, authorize("super_admin", "admin"), getAllUsers);
// BUG FIX: /avatar must come before /:id to prevent Express matching "avatar" as an ID param
router.put("/avatar", verifyToken, uploadProfile.single("avatar"), handleMulterError, updateAvatar);
router.get("/:id", verifyToken, authorizeSelf(), getUserById);
router.put("/:id", verifyToken, authorizeSelf(), updateUser);
router.put("/:id/toggle-status", verifyToken, authorize("super_admin", "admin"), toggleUserStatus);
// router.delete("/:id", verifyToken, authorize("super_admin"), deleteUser);

export default router;