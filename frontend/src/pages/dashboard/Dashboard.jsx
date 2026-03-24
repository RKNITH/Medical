

import { useSelector } from "react-redux";
import { useNavigate } from "react-router-dom";
import useFetch from "../../hooks/useFetch.js";
import {
    Users, UserRound, CalendarDays, BedDouble,
    FlaskConical, TrendingUp, Clock, CheckCircle,
    AlertCircle, Stethoscope, Receipt, FileText,
    MapPin, Phone, ArrowRight,
} from "lucide-react";
import LineChart from "../../components/charts/LineChart.jsx";
import BarChart from "../../components/charts/BarChart.jsx";
import PieChart from "../../components/charts/PieChart.jsx";
import Loader from "../../components/common/Loader.jsx";
import Badge from "../../components/common/Badge.jsx";
import { APPOINTMENT_STATUS_COLOR } from "../../utils/constants.js";
import { smartDate, formatDate } from "../../utils/formatDate.js";

const StatCard = ({ label, value, icon: Icon, color, sub }) => (
    <div className="bg-white rounded-2xl p-5 border border-slate-100 shadow-sm flex items-start justify-between gap-4">
        <div>
            <p className="text-sm text-slate-500 mb-1">{label}</p>
            <p className="text-3xl font-bold text-slate-800">{value ?? "—"}</p>
            {sub && <p className="text-xs text-slate-400 mt-1">{sub}</p>}
        </div>
        <div className={`w-12 h-12 rounded-xl flex items-center justify-center shrink-0 ${color}`}>
            <Icon size={22} className="text-white" />
        </div>
    </div>
);

const Section = ({ title, children, action }) => (
    <div className="bg-white rounded-2xl border border-slate-100 shadow-sm p-5">
        <div className="flex items-center justify-between mb-4">
            <h3 className="text-sm font-semibold text-slate-700">{title}</h3>
            {action}
        </div>
        {children}
    </div>
);

const EmptyState = ({ message }) => (
    <p className="text-slate-400 text-sm text-center py-8">{message}</p>
);

// ── today's date string for query ─────────────────────────────
const todayStr = new Date().toISOString().split("T")[0];

// ══════════════════════════════════════════════════════════════
//  DOCTOR DASHBOARD
// ══════════════════════════════════════════════════════════════
const DoctorDashboard = ({ user }) => {
    const navigate = useNavigate();

    // Step 1 — resolve doctor profile (get Doctor._id)
    const { data: myProfile, loading: profileLoading } = useFetch("/doctors/me");

    // Step 2 — fetch today's appointments using Doctor._id
    const { data: todayAppts, loading: todayLoading } = useFetch(
        myProfile?._id ? `/appointments/doctor/${myProfile._id}` : null,
        myProfile?._id ? { date: todayStr } : {}
    );

    // Step 3 — fetch ALL appointments for stats
    const { data: allAppts, loading: allLoading } = useFetch(
        myProfile?._id ? `/appointments/doctor/${myProfile._id}` : null
    );

    // Step 4 — pending lab tests ordered by this doctor
    const { data: labTests, loading: labLoading } = useFetch(
        myProfile?._id ? `/lab` : null,
        myProfile?._id ? { doctor: myProfile._id, status: "pending", limit: 5 } : {}
    );

    if (profileLoading) {
        return <div className="h-64 flex items-center justify-center"><Loader size="lg" /></div>;
    }

    if (!myProfile) {
        return (
            <div className="flex flex-col items-center justify-center h-64 gap-3">
                <AlertCircle size={40} className="text-red-400" />
                <p className="text-slate-600 font-medium">Doctor profile not found.</p>
                <p className="text-slate-400 text-sm">Contact admin to set up your profile.</p>
            </div>
        );
    }

    // derived stats
    const todayTotal = todayAppts?.length || 0;
    const todayPending = todayAppts?.filter((a) => a.status === "scheduled").length || 0;
    const todayCompleted = todayAppts?.filter((a) => a.status === "completed").length || 0;
    const totalPatientsSeen = allAppts?.filter((a) => a.status === "completed").length || 0;

    const isProfileIncomplete = !myProfile.consultationFee
        || myProfile.consultationFee === 0
        || !myProfile.availableSlots?.length;

    return (
        <div className="space-y-5">

            {/* Incomplete profile warning */}
            {isProfileIncomplete && (
                <div className="flex items-center justify-between p-4 bg-amber-50 border border-amber-200 rounded-xl">
                    <div className="flex items-center gap-3">
                        <AlertCircle size={18} className="text-amber-500 shrink-0" />
                        <div>
                            <p className="text-sm font-medium text-amber-800">Complete your profile</p>
                            <p className="text-xs text-amber-600">
                                Set your consultation fee and available slots so patients can book appointments.
                            </p>
                        </div>
                    </div>
                    <button
                        onClick={() => navigate("/my-profile")}
                        className="flex items-center gap-1 text-xs font-medium text-amber-700 hover:text-amber-900 border border-amber-300 px-3 py-1.5 rounded-lg hover:bg-amber-100 transition-colors"
                    >
                        Complete Now <ArrowRight size={12} />
                    </button>
                </div>
            )}

            {/* Doctor info strip */}
            <div className="bg-white rounded-2xl border border-slate-100 shadow-sm p-4 flex items-center gap-4">
                <div className="w-14 h-14 rounded-2xl bg-violet-100 flex items-center justify-center text-violet-600 font-bold text-2xl shrink-0 overflow-hidden">
                    {user.avatar
                        ? <img src={user.avatar} alt="" className="w-full h-full object-cover" />
                        : user.name?.charAt(0)
                    }
                </div>
                <div className="flex-1 min-w-0">
                    <p className="text-lg font-bold text-slate-800">Dr. {user.name}</p>
                    <p className="text-sm text-slate-500">{myProfile.specialization} — {myProfile.department}</p>
                    <p className="text-xs text-slate-400 font-mono mt-0.5">{myProfile.doctorId}</p>
                </div>
                <div className="hidden sm:flex flex-col items-end gap-1">
                    <Badge
                        label={myProfile.isAvailable ? "Available" : "Unavailable"}
                        className={myProfile.isAvailable ? "bg-green-100 text-green-700" : "bg-red-100 text-red-700"}
                    />
                    <p className="text-xs text-slate-400">₹{myProfile.consultationFee} / visit</p>
                </div>
            </div>

            {/* Stats */}
            {/* <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
                <StatCard
                    label="Today's Appointments"
                    value={todayTotal}
                    icon={CalendarDays}
                    color="bg-sky-500"
                    sub={`${todayPending} pending`}
                />
                <StatCard
                    label="Completed Today"
                    value={todayCompleted}
                    icon={CheckCircle}
                    color="bg-emerald-500"
                />
                <StatCard
                    label="Total Patients Seen"
                    value={totalPatientsSeen}
                    icon={UserRound}
                    color="bg-violet-500"
                />
                <StatCard
                    label="Pending Lab Tests"
                    value={labTests?.labTests?.length || 0}
                    icon={FlaskConical}
                    color="bg-rose-500"
                />
            </div> */}

            {/* Breakdown:
  - Default: 1 column (Stacked for mobile)
  - sm (640px+): 2 columns (Compact grid for small tablets)
  - lg (1024px+): 4 columns (Full layout for desktops)
  - gap-4 / md:gap-6: Spacing increases on larger screens
*/}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 md:gap-6">
                <StatCard
                    label="Today's Appointments"
                    value={todayTotal}
                    icon={CalendarDays}
                    color="bg-sky-500"
                    sub={`${todayPending} pending`}
                />
                <StatCard
                    label="Completed Today"
                    value={todayCompleted}
                    icon={CheckCircle}
                    color="bg-emerald-500"
                />
                <StatCard
                    label="Total Patients Seen"
                    value={totalPatientsSeen}
                    icon={UserRound}
                    color="bg-violet-500"
                />
                <StatCard
                    label="Pending Lab Tests"
                    value={labTests?.labTests?.length || 0}
                    icon={FlaskConical}
                    color="bg-rose-500"
                />
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">

                {/* Today's Schedule */}
                <Section
                    title={`Today's Schedule — ${new Date().toLocaleDateString("en-IN", { weekday: "long", day: "numeric", month: "short" })}`}
                    action={
                        <button
                            onClick={() => navigate("/appointments")}
                            className="text-xs text-sky-500 hover:underline flex items-center gap-1"
                        >
                            View All <ArrowRight size={12} />
                        </button>
                    }
                >
                    {todayLoading ? <Loader /> : !todayAppts?.length ? (
                        <EmptyState message="No appointments scheduled for today." />
                    ) : (
                        <div className="space-y-3">
                            {todayAppts.map((appt) => (
                                <div key={appt._id} className="flex items-center justify-between py-2.5 border-b border-slate-50 last:border-0">
                                    <div className="flex items-center gap-3">
                                        <div className="w-9 h-9 rounded-full bg-sky-100 flex items-center justify-center text-sky-600 font-semibold text-sm shrink-0">
                                            {appt.patient?.user?.name?.charAt(0)}
                                        </div>
                                        <div>
                                            <p className="text-sm font-medium text-slate-800">{appt.patient?.user?.name}</p>
                                            <p className="text-xs text-slate-400">{appt.timeSlot} — {appt.type?.toUpperCase()}</p>
                                        </div>
                                    </div>
                                    <Badge label={appt.status} className={APPOINTMENT_STATUS_COLOR[appt.status]} />
                                </div>
                            ))}
                        </div>
                    )}
                </Section>

                {/* Pending Lab Tests */}
                <Section
                    title="Pending Lab Tests"
                    action={
                        <button
                            onClick={() => navigate("/lab")}
                            className="text-xs text-sky-500 hover:underline flex items-center gap-1"
                        >
                            View All <ArrowRight size={12} />
                        </button>
                    }
                >
                    {labLoading ? <Loader /> : !labTests?.labTests?.length ? (
                        <EmptyState message="No pending lab tests." />
                    ) : (
                        <div className="space-y-3">
                            {labTests.labTests.slice(0, 5).map((test) => (
                                <div key={test._id} className="flex items-center justify-between py-2.5 border-b border-slate-50 last:border-0">
                                    <div className="flex items-center gap-3">
                                        <div className="w-8 h-8 rounded-lg bg-rose-50 flex items-center justify-center shrink-0">
                                            <FlaskConical size={14} className="text-rose-500" />
                                        </div>
                                        <div>
                                            <p className="text-sm font-medium text-slate-800">{test.testName}</p>
                                            <p className="text-xs text-slate-400">{test.patient?.user?.name}</p>
                                        </div>
                                    </div>
                                    <Badge label={test.status} className="bg-amber-100 text-amber-700" />
                                </div>
                            ))}
                        </div>
                    )}
                </Section>

            </div>

            {/* Available Slots */}
            <Section title="My Available Slots">
                {!myProfile.availableSlots?.length ? (
                    <div className="flex items-center gap-3 p-3 bg-amber-50 rounded-xl">
                        <AlertCircle size={16} className="text-amber-500 shrink-0" />
                        <p className="text-sm text-amber-700">
                            No slots configured.{" "}
                            <button onClick={() => navigate("/my-profile")} className="underline font-medium">
                                Add slots
                            </button>{" "}
                            so patients can book appointments.
                        </p>
                    </div>
                ) : (
                    <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3">
                        {myProfile.availableSlots.map((slot, i) => (
                            <div key={i} className="flex items-center gap-2 p-3 bg-slate-50 rounded-xl">
                                <Clock size={14} className="text-slate-400 shrink-0" />
                                <div>
                                    <p className="text-xs font-medium text-slate-700 capitalize">{slot.day}</p>
                                    <p className="text-xs text-slate-400">{slot.startTime} — {slot.endTime}</p>
                                </div>
                            </div>
                        ))}
                    </div>
                )}
            </Section>

        </div>
    );
};

// ══════════════════════════════════════════════════════════════
//  PATIENT DASHBOARD
// ══════════════════════════════════════════════════════════════
const PatientDashboard = ({ user }) => {
    const navigate = useNavigate();

    // Step 1 — resolve patient profile (get Patient._id + bed info)
    const { data: myProfile, loading: profileLoading } = useFetch("/patients/me");

    // Step 2 — fetch appointments using Patient._id
    const { data: appointments, loading: apptLoading } = useFetch(
        myProfile?._id ? `/appointments/patient/${myProfile._id}` : null
    );

    // Step 3 — fetch prescriptions
    const { data: prescriptions, loading: rxLoading } = useFetch(
        myProfile?._id ? `/prescriptions/patient/${myProfile._id}` : null
    );

    // Step 4 — fetch lab tests
    const { data: labTests, loading: labLoading } = useFetch(
        myProfile?._id ? `/lab/patient/${myProfile._id}` : null
    );

    // Step 5 — fetch bills
    const { data: bills, loading: billLoading } = useFetch(
        myProfile?._id ? `/billing/patient/${myProfile._id}` : null
    );

    if (profileLoading) {
        return <div className="h-64 flex items-center justify-center"><Loader size="lg" /></div>;
    }

    if (!myProfile) {
        return (
            <div className="flex flex-col items-center justify-center h-64 gap-3">
                <AlertCircle size={40} className="text-red-400" />
                <p className="text-slate-600 font-medium">Patient profile not found.</p>
                <p className="text-slate-400 text-sm">Contact reception to register your profile.</p>
            </div>
        );
    }

    // derived stats
    const upcoming = appointments?.filter((a) => a.status === "scheduled") || [];
    const completed = appointments?.filter((a) => a.status === "completed") || [];
    const pendingLab = labTests?.filter((t) => t.status !== "completed") || [];
    const unpaidBills = bills?.filter((b) => b.paymentStatus === "unpaid") || [];
    const unpaidAmount = unpaidBills.reduce((sum, b) => sum + b.finalAmount, 0);

    const nextAppointment = upcoming.sort(
        (a, b) => new Date(a.appointmentDate) - new Date(b.appointmentDate)
    )[0];

    const isProfileIncomplete = !myProfile.age || myProfile.age === 0 || !myProfile.emergencyContact?.phone;

    return (
        <div className="space-y-5">

            {/* Incomplete profile warning */}
            {isProfileIncomplete && (
                <div className="flex items-center justify-between p-4 bg-amber-50 border border-amber-200 rounded-xl">
                    <div className="flex items-center gap-3">
                        <AlertCircle size={18} className="text-amber-500 shrink-0" />
                        <div>
                            <p className="text-sm font-medium text-amber-800">Complete your profile</p>
                            <p className="text-xs text-amber-600">
                                Fill in your age, address and emergency contact details.
                            </p>
                        </div>
                    </div>
                    <button
                        onClick={() => navigate("/my-profile")}
                        className="flex items-center gap-1 text-xs font-medium text-amber-700 hover:text-amber-900 border border-amber-300 px-3 py-1.5 rounded-lg hover:bg-amber-100 transition-colors"
                    >
                        Complete Now <ArrowRight size={12} />
                    </button>
                </div>
            )}

            {/* Patient info strip */}
            <div className="bg-white rounded-2xl border border-slate-100 shadow-sm p-4 flex items-center gap-4">
                <div className="w-14 h-14 rounded-2xl bg-sky-100 flex items-center justify-center text-sky-600 font-bold text-2xl shrink-0 overflow-hidden">
                    {user.avatar
                        ? <img src={user.avatar} alt="" className="w-full h-full object-cover" />
                        : user.name?.charAt(0)
                    }
                </div>
                <div className="flex-1 min-w-0">
                    <p className="text-lg font-bold text-slate-800">{user.name}</p>
                    <p className="text-sm text-slate-500">
                        {myProfile.age > 0 ? `${myProfile.age} yrs` : "Age not set"} •{" "}
                        {myProfile.gender} •{" "}
                        {myProfile.bloodGroup || "Blood group not set"}
                    </p>
                    <p className="text-xs text-slate-400 font-mono mt-0.5">{myProfile.patientId}</p>
                </div>
                <div className="hidden sm:flex flex-col items-end gap-1">
                    <Badge
                        label={myProfile.isAdmitted ? "Admitted" : "Outpatient"}
                        className={myProfile.isAdmitted ? "bg-amber-100 text-amber-700" : "bg-green-100 text-green-700"}
                    />
                </div>
            </div>

            {/* Stats */}


            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 md:gap-6">
                <StatCard
                    label="Upcoming Appointments"
                    value={upcoming.length}
                    icon={CalendarDays}
                    color="bg-sky-500"
                />
                <StatCard
                    label="Prescriptions"
                    value={prescriptions?.length || 0}
                    icon={FileText}
                    color="bg-violet-500"
                />
                <StatCard
                    label="Pending Lab Tests"
                    value={pendingLab.length}
                    icon={FlaskConical}
                    color="bg-rose-500"
                />
                <StatCard
                    label="Unpaid Amount"
                    value={`₹${unpaidAmount}`}
                    icon={Receipt}
                    color={unpaidAmount > 0 ? "bg-red-500" : "bg-emerald-500"}
                    sub={`${unpaidBills.length} unpaid bill${unpaidBills.length !== 1 ? "s" : ""}`}
                />
            </div>

            {/* Admitted Bed Card */}
            {myProfile.isAdmitted && myProfile.assignedBed && (
                <div className="bg-amber-50 border border-amber-200 rounded-2xl p-5">
                    <div className="flex items-center gap-3 mb-3">
                        <div className="w-10 h-10 rounded-xl bg-amber-100 flex items-center justify-center shrink-0">
                            <BedDouble size={20} className="text-amber-600" />
                        </div>
                        <div>
                            <p className="text-sm font-semibold text-amber-800">Currently Admitted</p>
                            <p className="text-xs text-amber-600">You are currently admitted in the hospital</p>
                        </div>
                    </div>
                    <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                        <div className="p-3 bg-white rounded-xl">
                            <p className="text-xs text-slate-400">Bed Number</p>
                            <p className="text-sm font-bold text-slate-800">{myProfile.assignedBed.bedNumber}</p>
                        </div>
                        <div className="p-3 bg-white rounded-xl">
                            <p className="text-xs text-slate-400">Ward</p>
                            <p className="text-sm font-bold text-slate-800">{myProfile.assignedBed.ward}</p>
                        </div>
                        <div className="p-3 bg-white rounded-xl">
                            <p className="text-xs text-slate-400">Bed Type</p>
                            <p className="text-sm font-bold text-slate-800 capitalize">
                                {myProfile.assignedBed.type?.replace(/_/g, " ")}
                            </p>
                        </div>
                        <div className="p-3 bg-white rounded-xl">
                            <p className="text-xs text-slate-400">Price/Day</p>
                            <p className="text-sm font-bold text-slate-800">₹{myProfile.assignedBed.pricePerDay}</p>
                        </div>
                    </div>
                </div>
            )}

            {/* Next Appointment */}
            {nextAppointment && (
                <div className="bg-sky-50 border border-sky-200 rounded-2xl p-5">
                    <p className="text-xs font-semibold text-sky-600 uppercase tracking-wider mb-3">
                        Next Appointment
                    </p>
                    <div className="flex items-center justify-between">
                        <div className="flex items-center gap-3">
                            <div className="w-10 h-10 rounded-full bg-violet-100 flex items-center justify-center text-violet-600 font-semibold shrink-0">
                                {nextAppointment.doctor?.user?.name?.charAt(0)}
                            </div>
                            <div>
                                <p className="text-sm font-semibold text-slate-800">
                                    Dr. {nextAppointment.doctor?.user?.name}
                                </p>
                                <p className="text-xs text-slate-500">
                                    {smartDate(nextAppointment.appointmentDate)} at {nextAppointment.timeSlot}
                                </p>
                                <p className="text-xs text-slate-400 capitalize">{nextAppointment.type}</p>
                            </div>
                        </div>
                        <Badge label={nextAppointment.status} className={APPOINTMENT_STATUS_COLOR[nextAppointment.status]} />
                    </div>
                </div>
            )}

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">

                {/* My Appointments */}
                <Section
                    title="My Appointments"
                    action={
                        <button
                            onClick={() => navigate("/appointments")}
                            className="text-xs text-sky-500 hover:underline flex items-center gap-1"
                        >
                            View All <ArrowRight size={12} />
                        </button>
                    }
                >
                    {apptLoading ? <Loader /> : !appointments?.length ? (
                        <EmptyState message="No appointments found." />
                    ) : (
                        <div className="space-y-3">
                            {appointments.slice(0, 5).map((appt) => (
                                <div key={appt._id} className="flex items-center justify-between py-2.5 border-b border-slate-50 last:border-0">
                                    <div className="flex items-center gap-3">
                                        <div className="w-9 h-9 rounded-full bg-violet-100 flex items-center justify-center text-violet-600 font-semibold text-sm shrink-0">
                                            {appt.doctor?.user?.name?.charAt(0)}
                                        </div>
                                        <div>
                                            <p className="text-sm font-medium text-slate-800">Dr. {appt.doctor?.user?.name}</p>
                                            <p className="text-xs text-slate-400">{smartDate(appt.appointmentDate)} — {appt.timeSlot}</p>
                                        </div>
                                    </div>
                                    <Badge label={appt.status} className={APPOINTMENT_STATUS_COLOR[appt.status]} />
                                </div>
                            ))}
                        </div>
                    )}
                </Section>

                {/* Recent Prescriptions */}
                <Section
                    title="Recent Prescriptions"
                    action={
                        <button
                            onClick={() => navigate("/prescriptions")}
                            className="text-xs text-sky-500 hover:underline flex items-center gap-1"
                        >
                            View All <ArrowRight size={12} />
                        </button>
                    }
                >
                    {rxLoading ? <Loader /> : !prescriptions?.length ? (
                        <EmptyState message="No prescriptions found." />
                    ) : (
                        <div className="space-y-3">
                            {prescriptions.slice(0, 4).map((rx) => (
                                <div key={rx._id} className="py-2.5 border-b border-slate-50 last:border-0">
                                    <div className="flex items-center justify-between mb-1">
                                        <p className="text-sm font-medium text-slate-800">Dr. {rx.doctor?.user?.name}</p>
                                        <p className="text-xs text-slate-400">{formatDate(rx.createdAt)}</p>
                                    </div>
                                    <p className="text-xs text-slate-500 mb-1.5">
                                        <span className="font-medium">Diagnosis:</span> {rx.diagnosis}
                                    </p>
                                    <div className="flex flex-wrap gap-1">
                                        {rx.medicines?.slice(0, 3).map((med, i) => (
                                            <span key={i} className="px-2 py-0.5 bg-sky-50 text-sky-600 text-xs rounded-full">
                                                {med.name}
                                            </span>
                                        ))}
                                        {rx.medicines?.length > 3 && (
                                            <span className="px-2 py-0.5 bg-slate-100 text-slate-500 text-xs rounded-full">
                                                +{rx.medicines.length - 3} more
                                            </span>
                                        )}
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}
                </Section>

                {/* Lab Tests */}
                <Section
                    title="My Lab Tests"
                    action={
                        <button
                            onClick={() => navigate("/lab")}
                            className="text-xs text-sky-500 hover:underline flex items-center gap-1"
                        >
                            View All <ArrowRight size={12} />
                        </button>
                    }
                >
                    {labLoading ? <Loader /> : !labTests?.length ? (
                        <EmptyState message="No lab tests found." />
                    ) : (
                        <div className="space-y-3">
                            {labTests.slice(0, 5).map((test) => (
                                <div key={test._id} className="flex items-center justify-between py-2.5 border-b border-slate-50 last:border-0">
                                    <div className="flex items-center gap-3">
                                        <div className="w-8 h-8 rounded-lg bg-rose-50 flex items-center justify-center shrink-0">
                                            <FlaskConical size={14} className="text-rose-500" />
                                        </div>
                                        <div>
                                            <p className="text-sm font-medium text-slate-800">{test.testName}</p>
                                            <p className="text-xs text-slate-400">{formatDate(test.createdAt)}</p>
                                        </div>
                                    </div>
                                    <Badge
                                        label={test.status}
                                        className={test.status === "completed" ? "bg-green-100 text-green-700" : "bg-amber-100 text-amber-700"}
                                    />
                                </div>
                            ))}
                        </div>
                    )}
                </Section>

                {/* Bills */}
                <Section
                    title="My Bills"
                    action={
                        <button
                            onClick={() => navigate("/billing")}
                            className="text-xs text-sky-500 hover:underline flex items-center gap-1"
                        >
                            View All <ArrowRight size={12} />
                        </button>
                    }
                >
                    {billLoading ? <Loader /> : !bills?.length ? (
                        <EmptyState message="No bills found." />
                    ) : (
                        <div className="space-y-3">
                            {bills.slice(0, 5).map((bill) => (
                                <div key={bill._id} className="flex items-center justify-between py-2.5 border-b border-slate-50 last:border-0">
                                    <div className="flex items-center gap-3">
                                        <div className="w-8 h-8 rounded-lg bg-slate-50 flex items-center justify-center shrink-0">
                                            <Receipt size={14} className="text-slate-400" />
                                        </div>
                                        <div>
                                            <p className="text-sm font-medium text-slate-800 font-mono">{bill.billNo}</p>
                                            <p className="text-xs text-slate-400">{formatDate(bill.createdAt)}</p>
                                        </div>
                                    </div>
                                    <div className="text-right">
                                        <p className="text-sm font-bold text-slate-800">₹{bill.finalAmount}</p>
                                        <Badge
                                            label={bill.paymentStatus}
                                            className={
                                                bill.paymentStatus === "paid"
                                                    ? "bg-green-100 text-green-700"
                                                    : bill.paymentStatus === "partial"
                                                        ? "bg-yellow-100 text-yellow-700"
                                                        : "bg-red-100 text-red-700"
                                            }
                                        />
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}
                </Section>

            </div>
        </div>
    );
};

// ══════════════════════════════════════════════════════════════
//  ADMIN DASHBOARD
// ══════════════════════════════════════════════════════════════
const AdminDashboard = () => {
    const { data: stats, loading: statsLoading } = useFetch("/dashboard/stats");
    const { data: recentAppointments, loading: apptLoading } = useFetch("/dashboard/recent-appointments");
    const { data: revenueChart, loading: revenueLoading } = useFetch("/dashboard/revenue-chart");
    const { data: appointmentChart, loading: apptChartLoading } = useFetch("/dashboard/appointment-chart");

    const bedPieData = stats ? [
        { name: "Available", value: stats.availableBeds },
        { name: "Occupied", value: stats.occupiedBeds },
    ] : [];

    if (statsLoading) return <div className="h-40 flex items-center justify-center"><Loader size="lg" /></div>;

    return (
        <div className="space-y-5">
            <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4">
                <StatCard label="Total Patients" value={stats?.totalPatients} icon={UserRound} color="bg-sky-500" />
                <StatCard label="Total Doctors" value={stats?.totalDoctors} icon={Users} color="bg-violet-500" />
                <StatCard label="Today's Appointments" value={stats?.todayAppointments} icon={CalendarDays} color="bg-amber-500" sub={`${stats?.pendingAppointments} pending`} />
                <StatCard label="Bed Occupancy" value={`${stats?.bedOccupancyRate}%`} icon={BedDouble} color="bg-emerald-500" sub={`${stats?.availableBeds} available / ${stats?.totalBeds} total`} />
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4">
                <StatCard label="Pending Lab Tests" value={stats?.pendingLabTests} icon={FlaskConical} color="bg-rose-500" />
                <StatCard label="Today's Revenue" value={`₹${stats?.todayRevenue?.toLocaleString()}`} icon={TrendingUp} color="bg-teal-500" />
                <StatCard label="Total Revenue" value={`₹${stats?.totalRevenue?.toLocaleString()}`} icon={TrendingUp} color="bg-indigo-500" />
                <StatCard label="Total Staff" value={stats?.totalStaff} icon={Users} color="bg-pink-500" />
            </div>
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
                <Section title="Revenue — Last 7 Days">
                    {revenueLoading ? <Loader /> : (
                        <LineChart data={revenueChart || []} xKey="_id" lines={[{ key: "revenue", name: "Revenue (₹)", color: "#0ea5e9" }]} />
                    )}
                </Section>
                <Section title="Appointments — Last 7 Days">
                    {apptChartLoading ? <Loader /> : (
                        <BarChart data={appointmentChart || []} xKey="_id" bars={[{ key: "count", name: "Appointments", color: "#8b5cf6" }]} />
                    )}
                </Section>
            </div>
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
                <Section title="Bed Status">
                    <PieChart data={bedPieData} nameKey="name" valueKey="value" height={250} />
                </Section>
                <div className="lg:col-span-2">
                    <Section title="Recent Appointments">
                        {apptLoading ? <Loader /> : !recentAppointments?.length ? (
                            <EmptyState message="No appointments yet." />
                        ) : (
                            <div className="space-y-3">
                                {recentAppointments.slice(0, 6).map((appt) => (
                                    <div key={appt._id} className="flex items-center justify-between py-2.5 border-b border-slate-50 last:border-0">
                                        <div className="flex items-center gap-3">
                                            <div className="w-9 h-9 rounded-full bg-sky-100 flex items-center justify-center text-sky-600 font-semibold text-sm shrink-0">
                                                {appt.patient?.user?.name?.charAt(0)}
                                            </div>
                                            <div>
                                                <p className="text-sm font-medium text-slate-800">{appt.patient?.user?.name}</p>
                                                <p className="text-xs text-slate-400">Dr. {appt.doctor?.user?.name}</p>
                                            </div>
                                        </div>
                                        <div className="text-right">
                                            <Badge label={appt.status} className={APPOINTMENT_STATUS_COLOR[appt.status]} />
                                            <p className="text-xs text-slate-400 mt-1">{smartDate(appt.appointmentDate)}</p>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        )}
                    </Section>
                </div>
            </div>
        </div>
    );
};

// ══════════════════════════════════════════════════════════════
//  OTHER ROLES DASHBOARD
// ══════════════════════════════════════════════════════════════
const OtherRoleDashboard = ({ user }) => {
    const navigate = useNavigate();
    const roleModules = {
        nurse: [{ label: "Patients", path: "/patients", icon: UserRound }, { label: "Appointments", path: "/appointments", icon: CalendarDays }, { label: "Beds", path: "/beds", icon: BedDouble }],
        receptionist: [{ label: "Patients", path: "/patients", icon: UserRound }, { label: "Appointments", path: "/appointments", icon: CalendarDays }, { label: "Billing", path: "/billing", icon: Receipt }],
        lab_technician: [{ label: "Lab Orders", path: "/lab", icon: FlaskConical }],
        pharmacist: [{ label: "Pharmacy", path: "/pharmacy", icon: Stethoscope }],
    };
    const modules = roleModules[user?.role] || [];

    return (
        <div className="space-y-5">
            <div className="bg-white rounded-2xl border border-slate-100 shadow-sm p-6 flex items-center gap-4">
                <div className="w-14 h-14 rounded-2xl bg-sky-100 flex items-center justify-center text-sky-600 font-bold text-2xl shrink-0">
                    {user?.name?.charAt(0)}
                </div>
                <div>
                    <p className="text-lg font-bold text-slate-800">Welcome, {user?.name}</p>
                    <p className="text-sm text-slate-500 capitalize">{user?.role?.replace(/_/g, " ")}</p>
                </div>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                {modules.map((mod) => (
                    <button
                        key={mod.path}
                        onClick={() => navigate(mod.path)}
                        className="bg-white rounded-2xl border border-slate-100 shadow-sm p-5 flex items-center gap-4 hover:border-sky-200 hover:shadow-md transition-all text-left"
                    >
                        <div className="w-12 h-12 rounded-xl bg-sky-50 flex items-center justify-center shrink-0">
                            <mod.icon size={22} className="text-sky-500" />
                        </div>
                        <div>
                            <p className="text-sm font-semibold text-slate-700">{mod.label}</p>
                            <p className="text-xs text-slate-400">Go to {mod.label}</p>
                        </div>
                        <ArrowRight size={16} className="text-slate-300 ml-auto" />
                    </button>
                ))}
            </div>
        </div>
    );
};

// ══════════════════════════════════════════════════════════════
//  MAIN DASHBOARD — role router
// ══════════════════════════════════════════════════════════════
const Dashboard = () => {
    const { user } = useSelector((state) => state.auth);

    return (
        <div className="space-y-5">
            <div>
                <h1 className="text-2xl font-bold text-slate-800">Dashboard</h1>
                <p className="text-sm text-slate-500 mt-0.5 capitalize">
                    {user?.role?.replace(/_/g, " ")} Overview
                </p>
            </div>

            {["super_admin", "admin"].includes(user?.role) && <AdminDashboard />}
            {user?.role === "doctor" && <DoctorDashboard user={user} />}
            {user?.role === "patient" && <PatientDashboard user={user} />}
            {["nurse", "receptionist", "lab_technician", "pharmacist"].includes(user?.role) && (
                <OtherRoleDashboard user={user} />
            )}
        </div>
    );
};

export default Dashboard;