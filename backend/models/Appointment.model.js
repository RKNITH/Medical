import mongoose from "mongoose";

const appointmentSchema = new mongoose.Schema(
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
        appointmentDate: {
            type: Date,
            required: true,
        },
        timeSlot: {
            type: String,
            required: true,
        },
        type: {
            type: String,
            enum: ["opd", "ipd", "emergency"],
            default: "opd",
        },
        // BUG FIX: model was missing "no_show" status that the controller
        // already validates and allows. Mongoose would silently reject updates
        // with status:"no_show" due to enum mismatch — added here.
        status: {
            type: String,
            enum: ["scheduled", "in_progress", "completed", "cancelled", "no_show"],
            default: "scheduled",
        },
        reason: {
            type: String,
            trim: true,
        },
        notes: {
            type: String,
            trim: true,
        },
        cancelledBy: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "User",
            default: null,
        },
        cancelReason: {
            type: String,
            default: null,
        },
    },
    { timestamps: true }
);

// Index for common queries
appointmentSchema.index({ doctor: 1, appointmentDate: 1 });
appointmentSchema.index({ patient: 1, appointmentDate: -1 });
appointmentSchema.index({ status: 1 });

export default mongoose.model("Appointment", appointmentSchema);
