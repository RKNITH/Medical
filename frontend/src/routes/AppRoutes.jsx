import { Routes, Route, Navigate } from "react-router-dom";
import { useSelector } from "react-redux";
import ProtectedRoute from "./ProtectedRoute.jsx";

import Home from "../pages/Home.jsx";
import Login from "../pages/auth/Login.jsx";
import ForgotPassword from "../pages/auth/ForgotPassword.jsx";
import ResetPassword from "../pages/auth/ResetPassword.jsx";
import Dashboard from "../pages/dashboard/Dashboard.jsx";
import PatientList from "../pages/patients/PatientList.jsx";
import PatientDetail from "../pages/patients/PatientDetail.jsx";
import AddPatient from "../pages/patients/AddPatient.jsx";
import DoctorList from "../pages/doctors/DoctorList.jsx";
import DoctorDetail from "../pages/doctors/DoctorDetail.jsx";
import AddDoctor from "../pages/doctors/AddDoctor.jsx";
import AppointmentList from "../pages/appointments/AppointmentList.jsx";
import BookAppointment from "../pages/appointments/BookAppointment.jsx";
import Prescription from "../pages/prescriptions/Prescription.jsx";
import LabOrders from "../pages/lab/LabOrders.jsx";
import LabReport from "../pages/lab/LabReport.jsx";
import Inventory from "../pages/pharmacy/Inventory.jsx";
import DispenseMedicine from "../pages/pharmacy/DispenseMedicine.jsx";
import BillingList from "../pages/billing/BillingList.jsx";
import GenerateBill from "../pages/billing/GenerateBill.jsx";
import BedManagement from "../pages/beds/BedManagement.jsx";
import UserList from "../pages/users/UserList.jsx";
import NotFound from "../pages/NotFound.jsx";

// Redirects doctor/patient to their own detail page
const SelfProfileRedirect = () => {
    const { user } = useSelector((state) => state.auth);

    if (!user) return <Navigate to="/login" replace />;

    if (user.role === "doctor") return <Navigate to={`/doctors/me`} replace />;
    if (user.role === "patient") return <Navigate to={`/patients/me`} replace />;

    return <Navigate to="/dashboard" replace />;
};

const ADMIN = ["super_admin", "admin"];
const ALL_STAFF = ["super_admin", "admin", "doctor", "nurse", "receptionist", "lab_technician", "pharmacist"];

const AppRoutes = () => {
    const { user, initialized } = useSelector((state) => state.auth);

    return (
        <Routes>

            {/* Home — public landing page, auto-redirect logged-in users to dashboard */}
            <Route
                path="/"
                element={
                    initialized && user
                        ? <Navigate to="/dashboard" replace />
                        : <Home />
                }
            />

            {/* Public */}
            <Route path="/login" element={<Login />} />
            <Route path="/forgot-password" element={<ForgotPassword />} />
            <Route path="/reset-password/:token" element={<ResetPassword />} />

            {/* Dashboard — all roles */}
            <Route path="/dashboard" element={
                <ProtectedRoute allowedRoles={[...ALL_STAFF, "patient"]}>
                    <Dashboard />
                </ProtectedRoute>
            } />

            {/* My Profile — doctor/patient see their own profile */}
            <Route path="/my-profile" element={
                <ProtectedRoute allowedRoles={["doctor", "patient"]}>
                    <SelfProfileRedirect />
                </ProtectedRoute>
            } />

            {/* Patients */}
            <Route path="/patients" element={
                <ProtectedRoute allowedRoles={ALL_STAFF}>
                    <PatientList />
                </ProtectedRoute>
            } />
            <Route path="/patients/add" element={
                <ProtectedRoute allowedRoles={[...ADMIN, "receptionist"]}>
                    <AddPatient />
                </ProtectedRoute>
            } />
            <Route path="/patients/:id" element={
                <ProtectedRoute allowedRoles={[...ALL_STAFF, "patient"]}>
                    <PatientDetail />
                </ProtectedRoute>
            } />

            {/* Doctors */}
            <Route path="/doctors" element={
                <ProtectedRoute allowedRoles={[...ALL_STAFF, "patient"]}>
                    <DoctorList />
                </ProtectedRoute>
            } />
            <Route path="/doctors/add" element={
                <ProtectedRoute allowedRoles={ADMIN}>
                    <AddDoctor />
                </ProtectedRoute>
            } />
            <Route path="/doctors/:id" element={
                <ProtectedRoute allowedRoles={[...ALL_STAFF, "patient"]}>
                    <DoctorDetail />
                </ProtectedRoute>
            } />

            {/* Appointments */}
            <Route path="/appointments" element={
                <ProtectedRoute allowedRoles={[...ALL_STAFF, "patient"]}>
                    <AppointmentList />
                </ProtectedRoute>
            } />
            <Route path="/appointments/book" element={
                <ProtectedRoute allowedRoles={[...ADMIN, "receptionist", "patient"]}>
                    <BookAppointment />
                </ProtectedRoute>
            } />

            {/* Prescriptions */}
            <Route path="/prescriptions" element={
                <ProtectedRoute allowedRoles={[...ALL_STAFF, "patient"]}>
                    <Prescription />
                </ProtectedRoute>
            } />

            {/* Lab */}
            <Route path="/lab" element={
                <ProtectedRoute allowedRoles={[...ALL_STAFF, "patient"]}>
                    <LabOrders />
                </ProtectedRoute>
            } />
            <Route path="/lab/:id" element={
                <ProtectedRoute allowedRoles={[...ALL_STAFF, "patient"]}>
                    <LabReport />
                </ProtectedRoute>
            } />

            {/* Pharmacy */}
            <Route path="/pharmacy" element={
                <ProtectedRoute allowedRoles={[...ADMIN, "pharmacist"]}>
                    <Inventory />
                </ProtectedRoute>
            } />
            <Route path="/pharmacy/dispense" element={
                <ProtectedRoute allowedRoles={[...ADMIN, "pharmacist"]}>
                    <DispenseMedicine />
                </ProtectedRoute>
            } />

            {/* Billing */}
            <Route path="/billing" element={
                <ProtectedRoute allowedRoles={[...ADMIN, "receptionist", "patient"]}>
                    <BillingList />
                </ProtectedRoute>
            } />
            <Route path="/billing/generate" element={
                <ProtectedRoute allowedRoles={[...ADMIN, "receptionist"]}>
                    <GenerateBill />
                </ProtectedRoute>
            } />

            {/* Beds */}
            <Route path="/beds" element={
                <ProtectedRoute allowedRoles={[...ADMIN, "nurse", "receptionist"]}>
                    <BedManagement />
                </ProtectedRoute>
            } />

            {/* Users */}
            <Route path="/users" element={
                <ProtectedRoute allowedRoles={ADMIN}>
                    <UserList />
                </ProtectedRoute>
            } />

            {/* 403 */}
            <Route path="/unauthorized" element={
                <div className="flex flex-col items-center justify-center h-screen gap-4 bg-slate-50">
                    <h1 className="text-6xl font-black text-slate-200">403</h1>
                    <p className="text-slate-600 font-medium">Access Denied</p>
                    <p className="text-slate-400 text-sm">You don't have permission to view this page.</p>
                    <a href="/dashboard" className="text-sky-500 text-sm hover:underline">Go to Dashboard</a>
                </div>
            } />

            {/* 404 */}
            <Route path="*" element={<NotFound />} />

        </Routes>
    );
};

export default AppRoutes;