export const SIDEBAR_LINKS = {
    super_admin: ["dashboard", "users", "patients", "doctors", "appointments", "prescriptions", "lab", "pharmacy", "billing", "beds"],
    admin: ["dashboard", "users", "patients", "doctors", "appointments", "prescriptions", "lab", "pharmacy", "billing", "beds"],
    doctor: ["dashboard", "my-profile", "appointments", "prescriptions", "lab", "patients"],
    nurse: ["dashboard", "patients", "appointments", "beds"],
    receptionist: ["dashboard", "patients", "appointments", "billing", "beds"],
    lab_technician: ["dashboard", "lab"],
    pharmacist: ["dashboard", "pharmacy"],
    patient: ["dashboard", "my-profile", "appointments", "prescriptions", "lab", "billing"],
};

export const canAccess = (role, key) => {
    return SIDEBAR_LINKS[role]?.includes(key) ?? false;
};