import mongoose from "mongoose";

const medicineSchema = new mongoose.Schema(
    {
        name: {
            type: String,
            required: true,
            trim: true,
        },
        genericName: {
            type: String,
            trim: true,
        },
        category: {
            type: String,
            trim: true,
        },
        manufacturer: {
            type: String,
            trim: true,
        },
        stock: {
            type: Number,
            required: true,
            default: 0,
        },
        unit: {
            type: String,
            enum: ["tablet", "capsule", "syrup", "injection", "drops", "cream", "other"],
            required: true,
        },
        price: {
            type: Number,
            required: true,
        },
        expiryDate: {
            type: Date,
            required: true,
        },
        batchNumber: {
            type: String,
            trim: true,
        },
        reorderLevel: {
            type: Number,
            default: 10,
        },
        isAvailable: {
            type: Boolean,
            default: true,
        },
    },
    { timestamps: true }
);

export default mongoose.model("Medicine", medicineSchema);