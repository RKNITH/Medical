import mongoose from "mongoose";

const userSchema = new mongoose.Schema(
    {
        name: { type: String, required: true, trim: true },
        email: { type: String, required: true, unique: true, lowercase: true, trim: true },
        password: { type: String, required: true, select: false }, // ← select: false
        role: {
            type: String,
            enum: ["super_admin", "admin", "doctor", "nurse", "receptionist", "lab_technician", "pharmacist", "patient"],
            default: "patient",
        },
        phone: { type: String },
        avatar: { type: String },
        isActive: { type: Boolean, default: true },
        passwordResetToken: { type: String },
        passwordResetExpires: { type: Date },
    },
    { timestamps: true }
);

export default mongoose.model("User", userSchema);