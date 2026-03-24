import express from "express";
import {
    createBill,
    getAllBills,
    getBillById,
    getPatientBills,
    updatePaymentStatus,
    downloadBillPDF,
} from "../controllers/billing.controller.js";
import { verifyToken } from "../middleware/auth.middleware.js";
import { authorize } from "../middleware/role.middleware.js";

const router = express.Router();

router.post("/", verifyToken, authorize("super_admin", "admin", "receptionist"), createBill);
router.get("/", verifyToken, authorize("super_admin", "admin", "receptionist", "doctor"), getAllBills);
router.get("/patient/:patientId", verifyToken, getPatientBills); // ← patient can access their own
router.get("/:id", verifyToken, getBillById);
router.put("/:id/payment", verifyToken, authorize("super_admin", "admin", "receptionist"), updatePaymentStatus);
router.get("/:id/pdf", verifyToken, downloadBillPDF);

export default router;