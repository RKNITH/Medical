import express from "express";
import {
    addMedicine,
    getAllMedicines,
    getMedicineById,
    updateMedicine,
    updateStock,
    deleteMedicine,
} from "../controllers/pharmacy.controller.js";
import { verifyToken } from "../middleware/auth.middleware.js";
import { authorize } from "../middleware/role.middleware.js";

const router = express.Router();

router.post("/", verifyToken, authorize("super_admin", "admin", "pharmacist"), addMedicine);
router.get("/", verifyToken, getAllMedicines);
router.get("/:id", verifyToken, getMedicineById);
router.put("/:id", verifyToken, authorize("super_admin", "admin", "pharmacist"), updateMedicine);
router.put("/:id/stock", verifyToken, authorize("super_admin", "admin", "pharmacist"), updateStock);
router.delete("/:id", verifyToken, authorize("super_admin", "admin"), deleteMedicine);

export default router;