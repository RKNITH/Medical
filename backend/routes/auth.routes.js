import express from "express";
import {
    register,
    login,
    logout,
    getMe,
    forgotPassword,
    resetPassword,
    changePassword,
    refreshAccessToken,
} from "../controllers/auth.controller.js";
import { verifyToken } from "../middleware/auth.middleware.js";

const router = express.Router();

// ── Public — no middleware ───────────────────────────────────
router.post("/register", register);
router.post("/login", login);
router.post("/forgot-password", forgotPassword);
router.post("/reset-password/:token", resetPassword);
router.post("/refresh-token", refreshAccessToken); // ← no verifyToken here

// ── Protected ────────────────────────────────────────────────
router.get("/me", verifyToken, getMe);
router.post("/logout", verifyToken, logout);
router.put("/change-password", verifyToken, changePassword);

export default router;