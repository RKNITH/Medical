// import express from "express";
// import {
//     createLabTest,
//     getAllLabTests,
//     getPatientLabTests,
//     updateLabStatus,
//     uploadLabResult,
//     deleteLabTest,
// } from "../controllers/lab.controller.js";
// import { verifyToken } from "../middleware/auth.middleware.js";
// import { authorize } from "../middleware/role.middleware.js";
// import { uploadDocument, handleMulterError } from "../middleware/upload.middleware.js";

// const router = express.Router();

// router.post("/", verifyToken, authorize("doctor", "admin", "super_admin"), createLabTest);
// router.get("/", verifyToken, authorize("super_admin", "admin", "lab_technician", "doctor"), getAllLabTests);
// router.get("/patient/:patientId", verifyToken, getPatientLabTests);
// router.put("/:id/status", verifyToken, authorize("lab_technician", "admin", "super_admin"), updateLabStatus);
// router.put("/:id/result", verifyToken, authorize("lab_technician", "admin", "super_admin"), uploadDocument.single("report"), handleMulterError, uploadLabResult);
// router.delete("/:id", verifyToken, authorize("super_admin", "admin"), deleteLabTest);

// export default router;




import express from "express";
import {
    createLabTest,
    getAllLabTests,
    getLabTestById,
    getPatientLabTests,
    updateLabStatus,
    uploadLabResult,
    deleteLabTest,
} from "../controllers/lab.controller.js";
import { verifyToken } from "../middleware/auth.middleware.js";
import { authorize } from "../middleware/role.middleware.js";
import { uploadDocument, handleMulterError } from "../middleware/upload.middleware.js";

const router = express.Router();

router.post("/", verifyToken, authorize("doctor", "admin", "super_admin"), createLabTest);
router.get("/", verifyToken, authorize("super_admin", "admin", "lab_technician", "doctor"), getAllLabTests);
router.get("/patient/:patientId", verifyToken, getPatientLabTests); // patient + staff
router.get("/:id", verifyToken, getLabTestById);                    // ← NEW — fixes blank view page
router.put("/:id/status", verifyToken, authorize("lab_technician", "admin", "super_admin"), updateLabStatus);
router.put("/:id/result", verifyToken, authorize("lab_technician", "admin", "super_admin"), uploadDocument.single("report"), handleMulterError, uploadLabResult);
router.delete("/:id", verifyToken, authorize("super_admin", "admin"), deleteLabTest);

export default router;