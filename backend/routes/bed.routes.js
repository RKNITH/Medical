import express from "express";
import {
    createBed,
    getAllBeds,
    getBedById,
    updateBed,
    deleteBed,
} from "../controllers/bed.controller.js";
import { verifyToken } from "../middleware/auth.middleware.js";
import { authorize } from "../middleware/role.middleware.js";

const router = express.Router();

router.post("/", verifyToken, authorize("super_admin", "admin"), createBed);
router.get("/", verifyToken, getAllBeds);
router.get("/:id", verifyToken, getBedById);
router.put("/:id", verifyToken, authorize("super_admin", "admin", "nurse", "receptionist"), updateBed);
router.delete("/:id", verifyToken, authorize("super_admin", "admin"), deleteBed);

export default router;