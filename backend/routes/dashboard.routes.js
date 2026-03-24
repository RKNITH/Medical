import express from "express";
import {
    getDashboardStats,
    getRecentAppointments,
    getRevenueChart,
    getAppointmentChart,
} from "../controllers/dashboard.controller.js";
import { verifyToken } from "../middleware/auth.middleware.js";
import { authorize } from "../middleware/role.middleware.js";

const router = express.Router();

router.get("/stats", verifyToken, authorize("super_admin", "admin"), getDashboardStats);
router.get("/recent-appointments", verifyToken, authorize("super_admin", "admin"), getRecentAppointments);
router.get("/revenue-chart", verifyToken, authorize("super_admin", "admin"), getRevenueChart);
router.get("/appointment-chart", verifyToken, authorize("super_admin", "admin"), getAppointmentChart);

export default router;