import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { useSelector } from "react-redux";
import useFetch from "../../hooks/useFetch.js";
import api from "../../api/axios.js";
import {
    ArrowLeft, Mail, Phone, Stethoscope,
    Building2, Clock, Edit, Save, X,
    CalendarDays, BadgeCheck, AlertCircle,
    Plus, Trash2,
} from "lucide-react";
import Button from "../../components/common/Button.jsx";
import Badge from "../../components/common/Badge.jsx";
import Loader from "../../components/common/Loader.jsx";
import { APPOINTMENT_STATUS_COLOR, DEPARTMENTS } from "../../utils/constants.js";
import { smartDate } from "../../utils/formatDate.js";

const DAYS = ["monday", "tuesday", "wednesday", "thursday", "friday", "saturday", "sunday"];

const InfoRow = ({ icon: Icon, label, value }) => (
    <div className="flex items-start gap-3 py-2.5 border-b border-slate-50 last:border-0">
        <div className="w-8 h-8 rounded-lg bg-slate-50 flex items-center justify-center shrink-0">
            <Icon size={15} className="text-slate-400" />
        </div>
        <div>
            <p className="text-xs text-slate-400">{label}</p>
            <p className="text-sm font-medium text-slate-700">{value || "—"}</p>
        </div>
    </div>
);

const TabBtn = ({ active, onClick, children }) => (
    <button
        onClick={onClick}
        className={`px-4 py-2 text-sm font-medium rounded-lg transition-colors
            ${active ? "bg-sky-500 text-white" : "text-slate-500 hover:bg-slate-100"}`}
    >
        {children}
    </button>
);

const inputCls = "w-full px-3 py-2 rounded-lg border border-slate-200 text-sm outline-none focus:ring-2 focus:ring-sky-500 bg-slate-50";

const DoctorDetail = () => {
    const { id } = useParams();
    const navigate = useNavigate();
    const { user } = useSelector((state) => state.auth);

    // ── Resolve "me" using dedicated endpoint (avoids fetching all doctors) ──
    const isSelf = id === "me";

    // BUG FIX: original fetched all doctors (limit:200) just to find self.
    // Use /doctors/me endpoint which returns only the logged-in doctor's profile.
    const { data: selfDoctor, loading: selfLoading } = useFetch(
        isSelf ? "/doctors/me" : null
    );

    // For a specific id, fetch that doctor directly
    const { data: directDoctor, loading: directLoading, refetch: directRefetch } = useFetch(
        !isSelf ? `/doctors/${id}` : null
    );

    const doctor = isSelf ? selfDoctor : directDoctor;
    const loading = isSelf ? selfLoading : directLoading;
    const refetch = isSelf ? () => { } : directRefetch;
    const { data: appointments, loading: apptLoading } = useFetch(
        doctor?._id ? `/appointments/doctor/${doctor._id}` : null
    );

    const [activeTab, setActiveTab] = useState("overview");
    const [editMode, setEditMode] = useState(false);
    const [editData, setEditData] = useState({});
    const [slots, setSlots] = useState([]);
    const [saving, setSaving] = useState(false);
    const [saveError, setSaveError] = useState(null);

    // doctor can only edit their own profile
    // admin can edit any doctor
    const canEdit = ["super_admin", "admin"].includes(user?.role)
        || (user?.role === "doctor" && isSelf);

    // populate edit form when doctor loads
    useEffect(() => {
        if (doctor) {
            setEditData({
                specialization: doctor.specialization || "",
                department: doctor.department || "General",
                experience: doctor.experience || 0,
                consultationFee: doctor.consultationFee || 0,
                qualificationStr: doctor.qualification?.join(", ") || "",
                isAvailable: doctor.isAvailable ?? true,
            });
            setSlots(doctor.availableSlots?.map((s) => ({ ...s })) || []);
        }
    }, [doctor]);

    const addSlot = () => {
        setSlots([...slots, { day: "monday", startTime: "09:00", endTime: "17:00" }]);
    };

    const removeSlot = (index) => {
        setSlots(slots.filter((_, i) => i !== index));
    };

    const updateSlot = (index, field, value) => {
        const updated = [...slots];
        updated[index][field] = value;
        setSlots(updated);
    };

    const handleSave = async () => {
        setSaving(true);
        setSaveError(null);
        try {
            await api.put(`/doctors/${doctor._id}`, {
                specialization: editData.specialization,
                department: editData.department,
                experience: Number(editData.experience),
                consultationFee: Number(editData.consultationFee),
                qualification: editData.qualificationStr
                    ? editData.qualificationStr.split(",").map((q) => q.trim()).filter(Boolean)
                    : [],
                isAvailable: editData.isAvailable,
                availableSlots: slots,
            });
            await refetch();
            setEditMode(false);
        } catch (err) {
            setSaveError(err.response?.data?.message || "Failed to save.");
        } finally {
            setSaving(false);
        }
    };

    // ── Loading states ─────────────────────────────────────
    if (loading) return <div className="h-64 flex items-center justify-center"><Loader size="lg" /></div>;

    if (!doctor) {
        return (
            <div className="flex flex-col items-center justify-center mt-20 gap-3">
                <AlertCircle size={40} className="text-red-400" />
                <p className="text-slate-600 font-medium">Doctor profile not found.</p>
                <p className="text-slate-400 text-sm">Contact admin to set up your profile.</p>
            </div>
        );
    }

    if (loading) return <div className="h-64 flex items-center justify-center"><Loader size="lg" /></div>;
    if (!doctor) return <p className="text-center text-slate-400 mt-20">Doctor not found.</p>;

    const isIncomplete = !doctor.consultationFee
        || doctor.consultationFee === 0
        || !doctor.availableSlots?.length
        || !doctor.qualification?.length;

    return (
        <div className="space-y-5 max-w-5xl">

            {/* Header */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                <div className="flex items-center gap-3">
                    {!isSelf && (
                        <Button variant="ghost" size="sm" icon={ArrowLeft} onClick={() => navigate("/doctors")}>
                            Back
                        </Button>
                    )}
                    <div>
                        <h1 className="text-2xl font-bold text-slate-800">
                            {isSelf ? "My Profile" : `Dr. ${doctor.user?.name}`}
                        </h1>
                        <p className="text-sm text-slate-500 font-mono">{doctor.doctorId}</p>
                    </div>
                </div>
                {canEdit && !editMode && (
                    <Button variant="outline" icon={Edit} onClick={() => setEditMode(true)}>
                        {isSelf ? "Edit My Profile" : "Edit Doctor"}
                    </Button>
                )}
                {editMode && (
                    <div className="flex gap-2">
                        <Button variant="outline" icon={X} onClick={() => { setEditMode(false); setSaveError(null); }}>
                            Cancel
                        </Button>
                        <Button variant="primary" icon={Save} loading={saving} onClick={handleSave}>
                            Save Changes
                        </Button>
                    </div>
                )}
            </div>

            {/* Incomplete Profile Banner */}
            {isIncomplete && canEdit && !editMode && (
                <div className="flex items-center justify-between p-4 bg-amber-50 border border-amber-200 rounded-xl">
                    <div className="flex items-center gap-3">
                        <AlertCircle size={18} className="text-amber-500 shrink-0" />
                        <div>
                            <p className="text-sm font-medium text-amber-800">Profile incomplete</p>
                            <p className="text-xs text-amber-600">
                                Please fill in consultation fee, qualifications and available slots.
                            </p>
                        </div>
                    </div>
                    <Button variant="outline" size="sm" onClick={() => setEditMode(true)}>
                        Complete Now
                    </Button>
                </div>
            )}

            {saveError && (
                <div className="px-4 py-3 bg-red-50 border border-red-200 rounded-lg text-red-600 text-sm">
                    {saveError}
                </div>
            )}

            {/* Profile Card */}
            <div className="bg-white rounded-2xl border border-slate-100 shadow-sm p-6">
                <div className="flex flex-col sm:flex-row items-start gap-5">

                    {/* Avatar */}
                    <div className="w-20 h-20 rounded-2xl bg-violet-100 flex items-center justify-center text-violet-600 font-bold text-3xl shrink-0 overflow-hidden">
                        {doctor.user?.avatar
                            ? <img src={doctor.user.avatar} alt="" className="w-full h-full object-cover" />
                            : doctor.user?.name?.charAt(0)
                        }
                    </div>

                    {/* Info / Edit */}
                    {editMode ? (
                        <div className="flex-1 space-y-5">

                            {/* Professional Info */}
                            <div>
                                <p className="text-xs font-semibold text-violet-600 uppercase tracking-wider mb-3">
                                    Professional Information
                                </p>
                                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                                    <div>
                                        <label className="text-xs text-slate-400 mb-1 block">Specialization</label>
                                        <input
                                            value={editData.specialization}
                                            onChange={(e) => setEditData({ ...editData, specialization: e.target.value })}
                                            placeholder="e.g. Cardiologist"
                                            className={inputCls}
                                        />
                                    </div>
                                    <div>
                                        <label className="text-xs text-slate-400 mb-1 block">Department</label>
                                        <select
                                            value={editData.department}
                                            onChange={(e) => setEditData({ ...editData, department: e.target.value })}
                                            className={inputCls}
                                        >
                                            {DEPARTMENTS.map((d) => (
                                                <option key={d} value={d}>{d}</option>
                                            ))}
                                        </select>
                                    </div>
                                    <div>
                                        <label className="text-xs text-slate-400 mb-1 block">Experience (years)</label>
                                        <input
                                            type="number"
                                            min={0}
                                            value={editData.experience}
                                            onChange={(e) => setEditData({ ...editData, experience: e.target.value })}
                                            className={inputCls}
                                        />
                                    </div>
                                    <div>
                                        <label className="text-xs text-slate-400 mb-1 block">Consultation Fee (₹)</label>
                                        <input
                                            type="number"
                                            min={0}
                                            value={editData.consultationFee}
                                            onChange={(e) => setEditData({ ...editData, consultationFee: e.target.value })}
                                            placeholder="500"
                                            className={inputCls}
                                        />
                                    </div>
                                    <div className="sm:col-span-2">
                                        <label className="text-xs text-slate-400 mb-1 block">
                                            Qualifications <span className="text-slate-300">(comma separated)</span>
                                        </label>
                                        <input
                                            value={editData.qualificationStr}
                                            onChange={(e) => setEditData({ ...editData, qualificationStr: e.target.value })}
                                            placeholder="MBBS, MD, DNB"
                                            className={inputCls}
                                        />
                                    </div>
                                    <div className="sm:col-span-2 flex items-center gap-2 pt-1">
                                        <input
                                            type="checkbox"
                                            id="isAvailable"
                                            checked={editData.isAvailable}
                                            onChange={(e) => setEditData({ ...editData, isAvailable: e.target.checked })}
                                            className="w-4 h-4 accent-sky-500"
                                        />
                                        <label htmlFor="isAvailable" className="text-sm text-slate-700">
                                            Available for appointments
                                        </label>
                                    </div>
                                </div>
                            </div>

                            {/* Available Slots */}
                            <div>
                                <div className="flex items-center justify-between mb-3">
                                    <p className="text-xs font-semibold text-sky-600 uppercase tracking-wider">
                                        Available Slots
                                    </p>
                                    <Button type="button" variant="outline" size="sm" icon={Plus} onClick={addSlot}>
                                        Add Slot
                                    </Button>
                                </div>

                                {slots.length === 0 && (
                                    <p className="text-sm text-slate-400 text-center py-4 bg-slate-50 rounded-xl">
                                        No slots added. Click "Add Slot" to add your availability.
                                    </p>
                                )}

                                <div className="space-y-2">
                                    {slots.map((slot, index) => (
                                        <div key={index} className="grid grid-cols-3 gap-2 p-3 bg-slate-50 rounded-xl items-end">
                                            <div>
                                                <label className="text-xs text-slate-400 mb-1 block">Day</label>
                                                <select
                                                    value={slot.day}
                                                    onChange={(e) => updateSlot(index, "day", e.target.value)}
                                                    className={inputCls}
                                                >
                                                    {DAYS.map((d) => (
                                                        <option key={d} value={d} className="capitalize">{d}</option>
                                                    ))}
                                                </select>
                                            </div>
                                            <div>
                                                <label className="text-xs text-slate-400 mb-1 block">Start Time</label>
                                                <input
                                                    type="time"
                                                    value={slot.startTime}
                                                    onChange={(e) => updateSlot(index, "startTime", e.target.value)}
                                                    className={inputCls}
                                                />
                                            </div>
                                            <div className="flex items-end gap-2">
                                                <div className="flex-1">
                                                    <label className="text-xs text-slate-400 mb-1 block">End Time</label>
                                                    <input
                                                        type="time"
                                                        value={slot.endTime}
                                                        onChange={(e) => updateSlot(index, "endTime", e.target.value)}
                                                        className={inputCls}
                                                    />
                                                </div>
                                                <button
                                                    type="button"
                                                    onClick={() => removeSlot(index)}
                                                    className="mb-0.5 p-2 rounded-lg hover:bg-red-50 text-slate-400 hover:text-red-500 transition-colors"
                                                >
                                                    <Trash2 size={15} />
                                                </button>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            </div>

                        </div>
                    ) : (
                        <div className="flex-1 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-2">
                            <InfoRow icon={Mail} label="Email" value={doctor.user?.email} />
                            <InfoRow icon={Phone} label="Phone" value={doctor.user?.phone} />
                            <InfoRow icon={Stethoscope} label="Specialization" value={doctor.specialization} />
                            <InfoRow icon={Building2} label="Department" value={doctor.department} />
                            <InfoRow icon={BadgeCheck} label="Experience" value={`${doctor.experience} years`} />
                            <InfoRow icon={Clock} label="Consultation Fee" value={`₹${doctor.consultationFee}`} />
                            <div className="flex items-center gap-2 py-2.5">
                                <Badge
                                    label={doctor.isAvailable ? "Available" : "Unavailable"}
                                    className={doctor.isAvailable
                                        ? "bg-green-100 text-green-700"
                                        : "bg-red-100 text-red-700"}
                                />
                            </div>
                        </div>
                    )}
                </div>
            </div>

            {/* Tabs */}
            <div className="flex flex-wrap gap-2 bg-white rounded-2xl border border-slate-100 shadow-sm p-3">
                {["overview", "appointments"].map((tab) => (
                    <TabBtn key={tab} active={activeTab === tab} onClick={() => setActiveTab(tab)}>
                        {tab.charAt(0).toUpperCase() + tab.slice(1)}
                    </TabBtn>
                ))}
            </div>

            {/* Tab Content */}
            <div className="bg-white rounded-2xl border border-slate-100 shadow-sm p-6">

                {/* Overview */}
                {activeTab === "overview" && (
                    <div className="space-y-6">
                        <div>
                            <h3 className="text-sm font-semibold text-slate-700 mb-3">Qualifications</h3>
                            <div className="flex flex-wrap gap-2">
                                {doctor.qualification?.length > 0
                                    ? doctor.qualification.map((q, i) => (
                                        <span key={i} className="px-3 py-1 bg-violet-50 text-violet-700 text-xs font-medium rounded-full">
                                            {q}
                                        </span>
                                    ))
                                    : <p className="text-sm text-slate-400">No qualifications recorded.</p>
                                }
                            </div>
                        </div>
                        <div>
                            <h3 className="text-sm font-semibold text-slate-700 mb-3">Available Slots</h3>
                            {doctor.availableSlots?.length > 0 ? (
                                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
                                    {doctor.availableSlots.map((slot, i) => (
                                        <div key={i} className="flex items-center gap-3 p-3 bg-slate-50 rounded-xl">
                                            <Clock size={15} className="text-slate-400 shrink-0" />
                                            <div>
                                                <p className="text-sm font-medium text-slate-700 capitalize">{slot.day}</p>
                                                <p className="text-xs text-slate-400">{slot.startTime} — {slot.endTime}</p>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            ) : (
                                <p className="text-sm text-slate-400">No available slots recorded.</p>
                            )}
                        </div>
                    </div>
                )}

                {/* Appointments */}
                {activeTab === "appointments" && (
                    <div className="space-y-3">
                        {apptLoading ? <Loader /> : !appointments?.length ? (
                            <p className="text-sm text-slate-400 text-center py-8">No appointments found.</p>
                        ) : appointments.map((appt) => (
                            <div key={appt._id} className="flex items-center justify-between p-3 bg-slate-50 rounded-xl">
                                <div className="flex items-center gap-3">
                                    <div className="w-9 h-9 rounded-full bg-sky-100 flex items-center justify-center text-sky-600 font-semibold text-sm shrink-0">
                                        {appt.patient?.user?.name?.charAt(0)}
                                    </div>
                                    <div>
                                        <p className="text-sm font-medium text-slate-700">{appt.patient?.user?.name}</p>
                                        <p className="text-xs text-slate-400">{appt.timeSlot} — {appt.type?.toUpperCase()}</p>
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

            </div>
        </div>
    );
};

export default DoctorDetail;