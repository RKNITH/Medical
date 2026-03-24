// import express from "express";
// import {
//     createPrescription,
//     getPatientPrescriptions,
//     getPrescriptionById,
//     updatePrescription,
//     downloadPrescriptionPDF,
// } from "../controllers/prescription.controller.js";
// import { verifyToken } from "../middleware/auth.middleware.js";
// import { authorize } from "../middleware/role.middleware.js";

// const router = express.Router();

// router.post("/", verifyToken, authorize("doctor"), createPrescription);
// router.get("/patient/:patientId", verifyToken, getPatientPrescriptions);
// router.get("/:id", verifyToken, getPrescriptionById);
// router.put("/:id", verifyToken, authorize("doctor"), updatePrescription);
// router.get("/:id/pdf", verifyToken, downloadPrescriptionPDF);

// export default router;




import express from "express";
import {
    createPrescription,
    getPatientPrescriptions,
    getDoctorPrescriptions,
    getPrescriptionById,
    updatePrescription,
    downloadPrescriptionPDF,
} from "../controllers/prescription.controller.js";
import { verifyToken } from "../middleware/auth.middleware.js";
import { authorize } from "../middleware/role.middleware.js";

const router = express.Router();

router.post("/", verifyToken, authorize("doctor"), createPrescription);
router.get("/patient/:patientId", verifyToken, getPatientPrescriptions);
router.get("/doctor/:doctorId", verifyToken, getDoctorPrescriptions); // ← NEW, before /:id
router.get("/:id", verifyToken, getPrescriptionById);
router.put("/:id", verifyToken, authorize("doctor"), updatePrescription);
router.get("/:id/pdf", verifyToken, downloadPrescriptionPDF);

export default router;