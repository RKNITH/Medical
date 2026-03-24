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

export const BED_STATUS = {
    AVAILABLE: "available",
    OCCUPIED: "occupied",
    MAINTENANCE: "maintenance",
};

export const LAB_STATUS = {
    PENDING: "pending",
    SAMPLE_COLLECTED: "sample_collected",
    IN_PROGRESS: "in_progress",
    COMPLETED: "completed",
};

export const PAYMENT_MODE = {
    CASH: "cash",
    CARD: "card",
    INSURANCE: "insurance",
    ONLINE: "online",
};

export const PAYMENT_STATUS = {
    PAID: "paid",
    UNPAID: "unpaid",
    PARTIAL: "partial",
};

export const BLOOD_GROUPS = ["A+", "A-", "B+", "B-", "AB+", "AB-", "O+", "O-"];

export const DEPARTMENTS = [
    "Cardiology",
    "Neurology",
    "Orthopedics",
    "Pediatrics",
    "Gynecology",
    "Dermatology",
    "Radiology",
    "Oncology",
    "ENT",
    "General Medicine",
    "Emergency",
    "Pathology",
    "Pharmacy",
];