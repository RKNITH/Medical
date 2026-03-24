import multer from "multer";
import { CloudinaryStorage } from "multer-storage-cloudinary";
import cloudinary from "../config/cloudinary.js";

// ── Cloudinary Storage for Profile Photos ──────────────────
const profileStorage = new CloudinaryStorage({
    cloudinary,
    params: {
        folder: "medicore/profiles",
        allowed_formats: ["jpg", "jpeg", "png", "webp"],
        transformation: [{ width: 400, height: 400, crop: "fill" }],
    },
});

// ── Cloudinary Storage for Lab Reports / Documents ─────────
const documentStorage = new CloudinaryStorage({
    cloudinary,
    params: {
        folder: "medicore/documents",
        allowed_formats: ["jpg", "jpeg", "png", "pdf"],
        resource_type: "auto",
    },
});

// ── File Filter ─────────────────────────────────────────────
const imageFilter = (req, file, cb) => {
    const allowed = ["image/jpeg", "image/png", "image/webp", "image/jpg"];
    if (allowed.includes(file.mimetype)) {
        cb(null, true);
    } else {
        cb(new Error("Only JPG, PNG, and WEBP images are allowed."), false);
    }
};

const documentFilter = (req, file, cb) => {
    const allowed = ["image/jpeg", "image/png", "image/jpg", "application/pdf"];
    if (allowed.includes(file.mimetype)) {
        cb(null, true);
    } else {
        cb(new Error("Only JPG, PNG, and PDF files are allowed."), false);
    }
};

// ── Multer Instances ────────────────────────────────────────
export const uploadProfile = multer({
    storage: profileStorage,
    fileFilter: imageFilter,
    limits: { fileSize: 2 * 1024 * 1024 }, // 2MB
});

export const uploadDocument = multer({
    storage: documentStorage,
    fileFilter: documentFilter,
    limits: { fileSize: 5 * 1024 * 1024 }, // 5MB
});

// ── Multer Error Handler ────────────────────────────────────
export const handleMulterError = (err, req, res, next) => {
    if (err instanceof multer.MulterError) {
        if (err.code === "LIMIT_FILE_SIZE") {
            return res.status(400).json({ success: false, message: "File size exceeds allowed limit." });
        }
        return res.status(400).json({ success: false, message: err.message });
    }
    if (err) {
        return res.status(400).json({ success: false, message: err.message });
    }
    next();
};