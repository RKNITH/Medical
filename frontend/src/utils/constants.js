export const ROLES = {
    SUPER_ADMIN: "super_admin",
    ADMIN: "admin",
    DOCTOR: "doctor",
    NURSE: "nurse",
    RECEPTIONIST: "receptionist",
    LAB_TECHNICIAN: "lab_technician",
    PHARMACIST: "pharmacist",
    PATIENT: "patient",
};

export const APPOINTMENT_STATUS = {
    SCHEDULED: "scheduled",
    IN_PROGRESS: "in_progress",
    COMPLETED: "completed",
    CANCELLED: "cancelled",
};

export const APPOINTMENT_STATUS_COLOR = {
    scheduled: "bg-blue-100 text-blue-700",
    in_progress: "bg-yellow-100 text-yellow-700",
    completed: "bg-green-100 text-green-700",
    cancelled: "bg-red-100 text-red-700",
};

export const BED_STATUS_COLOR = {
    available: "bg-green-100 text-green-700",
    occupied: "bg-red-100 text-red-700",
    maintenance: "bg-yellow-100 text-yellow-700",
};

export const LAB_STATUS_COLOR = {
    pending: "bg-gray-100 text-gray-700",
    sample_collected: "bg-blue-100 text-blue-700",
    in_progress: "bg-yellow-100 text-yellow-700",
    completed: "bg-green-100 text-green-700",
};

export const PAYMENT_STATUS_COLOR = {
    paid: "bg-green-100 text-green-700",
    unpaid: "bg-red-100 text-red-700",
    partial: "bg-yellow-100 text-yellow-700",
};

export const DEPARTMENTS = [
    "Cardiology", "Neurology", "Orthopedics", "Pediatrics",
    "Gynecology", "Dermatology", "Radiology", "Oncology",
    "ENT", "General Medicine", "Emergency", "Pathology", "Pharmacy",
];

export const BLOOD_GROUPS = ["A+", "A-", "B+", "B-", "AB+", "AB-", "O+", "O-"];