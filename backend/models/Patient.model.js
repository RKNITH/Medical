import mongoose from "mongoose";

const patientSchema = new mongoose.Schema(
    {
        user: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "User",
            required: true,
        },
        patientId: {
            type: String,
            unique: true,
            required: true,
        },
        age: {
            type: Number,
            default: 0,         // ← removed required
        },
        gender: {
            type: String,
            enum: ["male", "female", "other"],
            default: "other",   // ← removed required
        },
        bloodGroup: {
            type: String,
            enum: ["A+", "A-", "B+", "B-", "AB+", "AB-", "O+", "O-"],
            default: "O+",      // ← safe default within enum
        },
        address: {
            street: { type: String, default: "" },
            city: { type: String, default: "" },
            state: { type: String, default: "" },
            pincode: { type: String, default: "" },
        },
        emergencyContact: {
            name: { type: String, default: "" },
            phone: { type: String, default: "" },
            relation: { type: String, default: "" },
        },
        allergies: [String],
        chronicConditions: [String],
        medicalHistory: [
            {
                condition: String,
                treatedAt: Date,
                notes: String,
            },
        ],
        isAdmitted: {
            type: Boolean,
            default: false,
        },
        assignedBed: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "Bed",
            default: null,
        },
    },
    { timestamps: true }
);

export default mongoose.model("Patient", patientSchema);