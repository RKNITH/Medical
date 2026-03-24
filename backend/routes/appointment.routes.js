import express from "express";
import {
    createAppointment,
    getAllAppointments,
    getAppointmentById,
    getDoctorAppointments,
    getPatientAppointments,
    updateAppointmentStatus,
    cancelAppointment,
} from "../controllers/appointment.controller.js";
import { verifyToken } from "../middleware/auth.middleware.js";
import { authorize } from "../middleware/role.middleware.js";

const router = express.Router();

router.post("/", verifyToken, authorize("super_admin", "admin", "receptionist", "patient"), createAppointment);
router.get("/", verifyToken, authorize("super_admin", "admin", "receptionist", "nurse"), getAllAppointments);
router.get("/doctor/:doctorId", verifyToken, authorize("super_admin", "admin", "doctor", "nurse", "receptionist"), getDoctorAppointments);
router.get("/patient/:patientId", verifyToken, getPatientAppointments);
router.get("/:id", verifyToken, getAppointmentById);
router.put("/:id/status", verifyToken, authorize("super_admin", "admin", "doctor", "nurse", "receptionist"), updateAppointmentStatus);
router.put("/:id/cancel", verifyToken, cancelAppointment);

export default router;