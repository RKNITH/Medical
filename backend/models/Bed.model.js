import mongoose from "mongoose";

const bedSchema = new mongoose.Schema(
    {
        bedNumber: {
            type: String,
            required: true,
            unique: true,
            trim: true,
        },
        ward: {
            type: String,
            required: true,
            trim: true,
        },
        type: {
            type: String,
            enum: ["general", "semi_private", "private", "icu"],
            required: true,
        },
        status: {
            type: String,
            enum: ["available", "occupied", "maintenance"],
            default: "available",
        },
        pricePerDay: {
            type: Number,
            required: true,
        },
        assignedPatient: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "Patient",
            default: null,
        },
        admittedAt: {
            type: Date,
            default: null,
        },
    },
    { timestamps: true }
);

export default mongoose.model("Bed", bedSchema);