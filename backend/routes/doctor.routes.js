import express from "express";
import {
    createDoctor,
    getAllDoctors,
    getDoctorById,
    updateDoctor,
    deleteDoctor,
    getMyDoctorProfile,
} from "../controllers/doctor.controller.js";
import { verifyToken } from "../middleware/auth.middleware.js";
import { authorize } from "../middleware/role.middleware.js";

const router = express.Router();

router.post("/", verifyToken, authorize("super_admin", "admin"), createDoctor);
router.get("/", verifyToken, getAllDoctors);
router.get("/me", verifyToken, authorize("doctor"), getMyDoctorProfile); // ← before /:id
router.get("/:id", verifyToken, getDoctorById);
router.put("/:id", verifyToken, authorize("super_admin", "admin", "doctor"), updateDoctor);
router.delete("/:id", verifyToken, authorize("super_admin", "admin"), deleteDoctor);

export default router;