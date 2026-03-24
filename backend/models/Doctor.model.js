import mongoose from "mongoose";

const doctorSchema = new mongoose.Schema(
    {
        user: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "User",
            required: true,
        },
        doctorId: {
            type: String,
            unique: true,
            required: true,
        },
        specialization: {
            type: String,
            default: "General",   // ← no required
        },
        department: {
            type: String,
            default: "General",   // ← no required
        },
        qualification: [String],
        experience: {
            type: Number,
            default: 0,
        },
        consultationFee: {
            type: Number,
            default: 0,           // ← no required
        },
        availableSlots: [
            {
                day: {
                    type: String,
                    enum: ["monday", "tuesday", "wednesday", "thursday", "friday", "saturday", "sunday"],
                },
                startTime: String,
                endTime: String,
            },
        ],
        isAvailable: {
            type: Boolean,
            default: true,
        },
    },
    { timestamps: true }
);

export default mongoose.model("Doctor", doctorSchema);