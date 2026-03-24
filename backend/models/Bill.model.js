import mongoose from "mongoose";

const billSchema = new mongoose.Schema(
    {
        billNo: {
            type: String,
            unique: true,
            required: true,
        },
        patient: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "Patient",
            required: true,
        },
        appointment: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "Appointment",
            default: null,
        },
        items: [
            {
                description: {
                    type: String,
                    required: true,
                },
                type: {
                    type: String,
                    enum: ["consultation", "lab", "pharmacy", "bed", "other"],
                    required: true,
                },
                amount: {
                    type: Number,
                    required: true,
                },
            },
        ],
        totalAmount: {
            type: Number,
            required: true,
        },
        discount: {
            type: Number,
            default: 0,
        },
        finalAmount: {
            type: Number,
            required: true,
        },
        paymentMode: {
            type: String,
            enum: ["cash", "card", "insurance", "online"],
            required: true,
        },
        paymentStatus: {
            type: String,
            enum: ["paid", "unpaid", "partial"],
            default: "unpaid",
        },
        paidAt: {
            type: Date,
            default: null,
        },
        generatedBy: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "User",
            required: true,
        },
    },
    { timestamps: true }
);

export default mongoose.model("Bill", billSchema);