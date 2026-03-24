import mongoose from "mongoose";

const prescriptionSchema = new mongoose.Schema(
    {
        appointment: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "Appointment",
            required: true,
        },
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
        diagnosis: {
            type: String,
            required: true,
            trim: true,
        },
        medicines: [
            {
                name: {
                    type: String,
                    required: true,
                },
                dosage: {
                    type: String,
                    required: true,
                },
                duration: {
                    type: String,
                    required: true,
                },
                instruction: {
                    type: String,
                },
            },
        ],
        notes: {
            type: String,
            trim: true,
        },
        followUpDate: {
            type: Date,
            default: null,
        },
    },
    { timestamps: true }
);

export default mongoose.model("Prescription", prescriptionSchema);