import express from "express";
import {
    createPatient,
    getAllPatients,
    getPatientById,
    updatePatient,
    addMedicalHistory,
    deletePatient,
    getMyPatientProfile,
} from "../controllers/patient.controller.js";
import { verifyToken } from "../middleware/auth.middleware.js";
import { authorize } from "../middleware/role.middleware.js";

const router = express.Router();

router.post("/", verifyToken, authorize("super_admin", "admin", "receptionist"), createPatient);
router.get("/", verifyToken, authorize("super_admin", "admin", "doctor", "nurse", "receptionist"), getAllPatients);
router.get("/me", verifyToken, authorize("patient"), getMyPatientProfile); // ← must be before /:id

router.get("/:id", verifyToken, getPatientById);
router.put("/:id", verifyToken, authorize("super_admin", "admin", "receptionist", "patient"), updatePatient); // ← patient added
router.post("/:id/medical-history", verifyToken, authorize("super_admin", "admin", "doctor"), addMedicalHistory);
router.delete("/:id", verifyToken, authorize("super_admin", "admin"), deletePatient);

export default router;