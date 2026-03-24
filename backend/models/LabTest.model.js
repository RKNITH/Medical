import mongoose from "mongoose";

const labTestSchema = new mongoose.Schema(
    {
        patient: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "Patient",
            required: true,
        },
        doctor: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "Doctor",
            required: true,
        },
        testName: {
            type: String,
            required: true,
            trim: true,
        },
        testCode: {
            type: String,
            trim: true,
        },
        status: {
            type: String,
            enum: ["pending", "sample_collected", "in_progress", "completed"],
            default: "pending",
        },
        result: {
            type: String,
            default: null,
        },
        reportUrl: {
            type: String,
            default: null,
        },
        price: {
            type: Number,
            required: true,
        },
        collectedAt: {
            type: Date,
            default: null,
        },
        completedAt: {
            type: Date,
            default: null,
        },
        notes: {
            type: String,
            trim: true,
        },
        processedBy: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "User",
            default: null,
        },
    },
    { timestamps: true }
);

export default mongoose.model("LabTest", labTestSchema);