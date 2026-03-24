import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { useSelector } from "react-redux";
import useFetch from "../../hooks/useFetch.js";
import api from "../../api/axios.js";
import {
    ArrowLeft, User, Phone, Mail, MapPin,
    AlertCircle, Stethoscope, CalendarDays,
    FlaskConical, Receipt, Edit, Save, X, Heart,
} from "lucide-react";
import Button from "../../components/common/Button.jsx";
import Badge from "../../components/common/Badge.jsx";
import Loader from "../../components/common/Loader.jsx";
import { APPOINTMENT_STATUS_COLOR, BLOOD_GROUPS } from "../../utils/constants.js";
import { formatDate, smartDate } from "../../utils/formatDate.js";

const InfoRow = ({ icon: Icon, label, value }) => (
    <div className="flex items-start gap-3 py-2.5 border-b border-slate-50 last:border-0">
        <div className="w-8 h-8 rounded-lg bg-slate-50 flex items-center justify-center shrink-0">
            <Icon size={15} className="text-slate-400" />
        </div>
        <div>
            <p className="text-xs text-slate-400">{label}</p>
            <p className="text-sm font-medium text-slate-700 capitalize">{value || "—"}</p>
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

const PatientDetail = () => {
    const { id } = useParams();
    const navigate = useNavigate();
    const { user } = useSelector((state) => state.auth);

    // ── Resolve "me" using dedicated endpoint (avoids fetching all patients) ──
    const isSelf = id === "me";

    // BUG FIX: original fetched all patients (limit:200) to find self — O(n) waste.
    // Use /patients/me endpoint which returns only the logged-in patient's profile.
    const { data: selfPatient, loading: selfLoading, refetch: selfRefetch } = useFetch(
        isSelf ? "/patients/me" : null
    );
    const { data: directPatient, loading: directLoading, refetch: directRefetch } = useFetch(
        !isSelf ? `/patients/${id}` : null
    );

    const patient = isSelf ? selfPatient : directPatient;
    const loading = isSelf ? selfLoading : directLoading;
    const refetch = isSelf ? selfRefetch : directRefetch;

    // resolvedId comes from the fetched patient document
    const resolvedId = patient?._id;

    // ── Related data (only once resolvedId is known) ───────
    const { data: appointments, loading: apptLoading } = useFetch(
        resolvedId ? `/appointments/patient/${resolvedId}` : null
    );
    const { data: labTests, loading: labLoading } = useFetch(
        resolvedId ? `/lab/patient/${resolvedId}` : null
    );
    const { data: bills, loading: billLoading } = useFetch(
        resolvedId ? `/billing/patient/${resolvedId}` : null
    );
    const { data: prescriptions, loading: rxLoading } = useFetch(
        resolvedId ? `/prescriptions/patient/${resolvedId}` : null
    );

    const [activeTab, setActiveTab] = useState("overview");
    const [editMode, setEditMode] = useState(false);
    const [editData, setEditData] = useState({});
    const [saving, setSaving] = useState(false);
    const [saveError, setSaveError] = useState(null);

    // patient can edit their own profile, staff can edit any
    const canEdit = ["super_admin", "admin", "receptionist"].includes(user?.role)
        || (user?.role === "patient" && isSelf);

    // populate edit form when patient loads
    useEffect(() => {
        if (patient) {
            setEditData({
                age: patient.age || "",
                gender: patient.gender || "other",
                bloodGroup: patient.bloodGroup || "O+",
                allergiesStr: patient.allergies?.join(", ") || "",
                chronicStr: patient.chronicConditions?.join(", ") || "",
                street: patient.address?.street || "",
                city: patient.address?.city || "",
                state: patient.address?.state || "",
                pincode: patient.address?.pincode || "",
                emergencyName: patient.emergencyContact?.name || "",
                emergencyPhone: patient.emergencyContact?.phone || "",
                emergencyRelation: patient.emergencyContact?.relation || "",
            });
        }
    }, [patient]);

    const handleEditSave = async () => {
        setSaving(true);
        setSaveError(null);
        try {
            await api.put(`/patients/${resolvedId}`, {
                age: Number(editData.age),
                gender: editData.gender,
                bloodGroup: editData.bloodGroup,
                allergies: editData.allergiesStr
                    ? editData.allergiesStr.split(",").map((a) => a.trim()).filter(Boolean)
                    : [],
                chronicConditions: editData.chronicStr
                    ? editData.chronicStr.split(",").map((c) => c.trim()).filter(Boolean)
                    : [],
                address: {
                    street: editData.street,
                    city: editData.city,
                    state: editData.state,
                    pincode: editData.pincode,
                },
                emergencyContact: {
                    name: editData.emergencyName,
                    phone: editData.emergencyPhone,
                    relation: editData.emergencyRelation,
                },
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

    if (!patient) {
        return (
            <div className="flex flex-col items-center justify-center mt-20 gap-3">
                <AlertCircle size={40} className="text-red-400" />
                <p className="text-slate-600 font-medium">Patient profile not found.</p>
                <p className="text-slate-400 text-sm">Contact admin to set up your profile.</p>
            </div>
        );
    }

    if (isSelf && allPatients && !resolvedId) {
        return (
            <div className="flex flex-col items-center justify-center mt-20 gap-3">
                <AlertCircle size={40} className="text-red-400" />
                <p className="text-slate-600 font-medium">Patient profile not found.</p>
                <p className="text-slate-400 text-sm">Contact admin to set up your profile.</p>
            </div>
        );
    }

    if (loading) return <div className="h-64 flex items-center justify-center"><Loader size="lg" /></div>;
    if (!patient) return <p className="text-center text-slate-400 mt-20">Patient not found.</p>;

    // check if profile is incomplete
    const isIncomplete = !patient.age || patient.age === 0 || !patient.emergencyContact?.phone;

    return (
        <div className="space-y-5 max-w-6xl">

            {/* Header */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                <div className="flex items-center gap-3">
                    {!isSelf && (
                        <Button variant="ghost" size="sm" icon={ArrowLeft} onClick={() => navigate("/patients")}>
                            Back
                        </Button>
                    )}
                    <div>
                        <h1 className="text-2xl font-bold text-slate-800">
                            {isSelf ? "My Profile" : patient.user?.name}
                        </h1>
                        <p className="text-sm text-slate-500 font-mono">{patient.patientId}</p>
                    </div>
                </div>
                {canEdit && !editMode && (
                    <Button variant="outline" icon={Edit} onClick={() => setEditMode(true)}>
                        {isSelf ? "Edit My Profile" : "Edit Patient"}
                    </Button>
                )}
                {editMode && (
                    <div className="flex gap-2">
                        <Button variant="outline" icon={X} onClick={() => { setEditMode(false); setSaveError(null); }}>
                            Cancel
                        </Button>
                        <Button variant="primary" icon={Save} loading={saving} onClick={handleEditSave}>
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
                                Please fill in age, address and emergency contact details.
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
                    <div className="w-20 h-20 rounded-2xl bg-sky-100 flex items-center justify-center text-sky-600 font-bold text-3xl shrink-0 overflow-hidden">
                        {patient.user?.avatar
                            ? <img src={patient.user.avatar} alt="" className="w-full h-full object-cover" />
                            : patient.user?.name?.charAt(0)
                        }
                    </div>

                    {/* Info / Edit Form */}
                    {editMode ? (
                        <div className="flex-1 space-y-5">

                            {/* Personal */}
                            <div>
                                <p className="text-xs font-semibold text-sky-600 uppercase tracking-wider mb-3">
                                    Personal Information
                                </p>
                                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                                    <div>
                                        <label className="text-xs text-slate-400 mb-1 block">Age</label>
                                        <input
                                            type="number"
                                            min={1}
                                            value={editData.age}
                                            onChange={(e) => setEditData({ ...editData, age: e.target.value })}
                                            className={inputCls}
                                        />
                                    </div>
                                    <div>
                                        <label className="text-xs text-slate-400 mb-1 block">Gender</label>
                                        <select
                                            value={editData.gender}
                                            onChange={(e) => setEditData({ ...editData, gender: e.target.value })}
                                            className={inputCls}
                                        >
                                            <option value="male">Male</option>
                                            <option value="female">Female</option>
                                            <option value="other">Other</option>
                                        </select>
                                    </div>
                                    <div>
                                        <label className="text-xs text-slate-400 mb-1 block">Blood Group</label>
                                        <select
                                            value={editData.bloodGroup}
                                            onChange={(e) => setEditData({ ...editData, bloodGroup: e.target.value })}
                                            className={inputCls}
                                        >
                                            {BLOOD_GROUPS.map((bg) => (
                                                <option key={bg} value={bg}>{bg}</option>
                                            ))}
                                        </select>
                                    </div>
                                    <div className="sm:col-span-3">
                                        <label className="text-xs text-slate-400 mb-1 block">
                                            Allergies <span className="text-slate-300">(comma separated)</span>
                                        </label>
                                        <input
                                            value={editData.allergiesStr}
                                            onChange={(e) => setEditData({ ...editData, allergiesStr: e.target.value })}
                                            placeholder="Penicillin, Dust, Pollen"
                                            className={inputCls}
                                        />
                                    </div>
                                    <div className="sm:col-span-3">
                                        <label className="text-xs text-slate-400 mb-1 block">
                                            Chronic Conditions <span className="text-slate-300">(comma separated)</span>
                                        </label>
                                        <input
                                            value={editData.chronicStr}
                                            onChange={(e) => setEditData({ ...editData, chronicStr: e.target.value })}
                                            placeholder="Diabetes, Hypertension"
                                            className={inputCls}
                                        />
                                    </div>
                                </div>
                            </div>

                            {/* Address */}
                            <div>
                                <p className="text-xs font-semibold text-emerald-600 uppercase tracking-wider mb-3">
                                    Address
                                </p>
                                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                                    <div className="sm:col-span-2">
                                        <label className="text-xs text-slate-400 mb-1 block">Street</label>
                                        <input
                                            value={editData.street}
                                            onChange={(e) => setEditData({ ...editData, street: e.target.value })}
                                            placeholder="123 Main St"
                                            className={inputCls}
                                        />
                                    </div>
                                    <div>
                                        <label className="text-xs text-slate-400 mb-1 block">City</label>
                                        <input
                                            value={editData.city}
                                            onChange={(e) => setEditData({ ...editData, city: e.target.value })}
                                            placeholder="Mumbai"
                                            className={inputCls}
                                        />
                                    </div>
                                    <div>
                                        <label className="text-xs text-slate-400 mb-1 block">State</label>
                                        <input
                                            value={editData.state}
                                            onChange={(e) => setEditData({ ...editData, state: e.target.value })}
                                            placeholder="Maharashtra"
                                            className={inputCls}
                                        />
                                    </div>
                                    <div>
                                        <label className="text-xs text-slate-400 mb-1 block">Pincode</label>
                                        <input
                                            value={editData.pincode}
                                            onChange={(e) => setEditData({ ...editData, pincode: e.target.value })}
                                            placeholder="400001"
                                            className={inputCls}
                                        />
                                    </div>
                                </div>
                            </div>

                            {/* Emergency Contact */}
                            <div>
                                <p className="text-xs font-semibold text-red-500 uppercase tracking-wider mb-3">
                                    Emergency Contact
                                </p>
                                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                                    <div>
                                        <label className="text-xs text-slate-400 mb-1 block">Name</label>
                                        <input
                                            value={editData.emergencyName}
                                            onChange={(e) => setEditData({ ...editData, emergencyName: e.target.value })}
                                            placeholder="John Doe"
                                            className={inputCls}
                                        />
                                    </div>
                                    <div>
                                        <label className="text-xs text-slate-400 mb-1 block">Phone</label>
                                        <input
                                            value={editData.emergencyPhone}
                                            onChange={(e) => setEditData({ ...editData, emergencyPhone: e.target.value })}
                                            placeholder="+91 9876543210"
                                            className={inputCls}
                                        />
                                    </div>
                                    <div>
                                        <label className="text-xs text-slate-400 mb-1 block">Relation</label>
                                        <input
                                            value={editData.emergencyRelation}
                                            onChange={(e) => setEditData({ ...editData, emergencyRelation: e.target.value })}
                                            placeholder="Father"
                                            className={inputCls}
                                        />
                                    </div>
                                </div>
                            </div>

                        </div>
                    ) : (
                        <div className="flex-1 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-x-4">
                            <InfoRow icon={User} label="Full Name" value={patient.user?.name} />
                            <InfoRow icon={Mail} label="Email" value={patient.user?.email} />
                            <InfoRow icon={Phone} label="Phone" value={patient.user?.phone} />
                            <InfoRow icon={MapPin} label="City" value={patient.address?.city || "Not provided"} />
                            <InfoRow icon={User} label="Age" value={patient.age ? `${patient.age} years` : "Not provided"} />
                            <InfoRow icon={User} label="Gender" value={patient.gender} />
                            <InfoRow icon={Heart} label="Blood Group" value={patient.bloodGroup || "Not provided"} />
                            <InfoRow icon={MapPin} label="Address" value={
                                patient.address?.street
                                    ? `${patient.address.street}, ${patient.address.city}`
                                    : "Not provided"
                            } />
                            <div className="flex items-center gap-2 py-2.5">
                                <Badge
                                    label={patient.isAdmitted ? "Admitted" : "Outpatient"}
                                    className={patient.isAdmitted
                                        ? "bg-amber-100 text-amber-700"
                                        : "bg-green-100 text-green-700"}
                                />
                            </div>
                        </div>
                    )}
                </div>
            </div>

            {/* Tabs */}
            <div className="flex flex-wrap gap-2 bg-white rounded-2xl border border-slate-100 shadow-sm p-3">
                {["overview", "appointments", "prescriptions", "lab", "billing"].map((tab) => (
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
                            <h3 className="text-sm font-semibold text-slate-700 mb-3">Allergies</h3>
                            <div className="flex flex-wrap gap-2">
                                {patient.allergies?.length > 0
                                    ? patient.allergies.map((a, i) => (
                                        <span key={i} className="px-3 py-1 bg-red-50 text-red-600 text-xs rounded-full">{a}</span>
                                    ))
                                    : <p className="text-sm text-slate-400">No allergies recorded.</p>
                                }
                            </div>
                        </div>
                        <div>
                            <h3 className="text-sm font-semibold text-slate-700 mb-3">Chronic Conditions</h3>
                            <div className="flex flex-wrap gap-2">
                                {patient.chronicConditions?.length > 0
                                    ? patient.chronicConditions.map((c, i) => (
                                        <span key={i} className="px-3 py-1 bg-amber-50 text-amber-700 text-xs rounded-full">{c}</span>
                                    ))
                                    : <p className="text-sm text-slate-400">No chronic conditions recorded.</p>
                                }
                            </div>
                        </div>
                        <div>
                            <h3 className="text-sm font-semibold text-slate-700 mb-3">Medical History</h3>
                            {patient.medicalHistory?.length > 0 ? (
                                <div className="space-y-3">
                                    {patient.medicalHistory.map((h, i) => (
                                        <div key={i} className="flex items-start gap-3 p-3 bg-slate-50 rounded-xl">
                                            <Stethoscope size={16} className="text-slate-400 mt-0.5 shrink-0" />
                                            <div>
                                                <p className="text-sm font-medium text-slate-700">{h.condition}</p>
                                                <p className="text-xs text-slate-400">{formatDate(h.treatedAt)}</p>
                                                {h.notes && <p className="text-xs text-slate-500 mt-1">{h.notes}</p>}
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            ) : (
                                <p className="text-sm text-slate-400">No medical history recorded.</p>
                            )}
                        </div>
                        <div>
                            <h3 className="text-sm font-semibold text-slate-700 mb-3">Emergency Contact</h3>
                            {patient.emergencyContact?.name ? (
                                <div className="p-3 bg-slate-50 rounded-xl space-y-1">
                                    <p className="text-sm font-medium text-slate-700">{patient.emergencyContact.name}</p>
                                    <p className="text-xs text-slate-500">
                                        {patient.emergencyContact.relation} — {patient.emergencyContact.phone}
                                    </p>
                                </div>
                            ) : (
                                <p className="text-sm text-slate-400">No emergency contact recorded.</p>
                            )}
                        </div>
                        <div>
                            <h3 className="text-sm font-semibold text-slate-700 mb-3">Full Address</h3>
                            {patient.address?.city ? (
                                <div className="p-3 bg-slate-50 rounded-xl">
                                    <p className="text-sm text-slate-700">
                                        {[patient.address.street, patient.address.city, patient.address.state, patient.address.pincode]
                                            .filter(Boolean).join(", ")}
                                    </p>
                                </div>
                            ) : (
                                <p className="text-sm text-slate-400">No address recorded.</p>
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
                                    <CalendarDays size={16} className="text-slate-400 shrink-0" />
                                    <div>
                                        <p className="text-sm font-medium text-slate-700">Dr. {appt.doctor?.user?.name}</p>
                                        <p className="text-xs text-slate-400">{smartDate(appt.appointmentDate)} — {appt.timeSlot}</p>
                                    </div>
                                </div>
                                <Badge label={appt.status} className={APPOINTMENT_STATUS_COLOR[appt.status]} />
                            </div>
                        ))}
                    </div>
                )}

                {/* Prescriptions */}
                {activeTab === "prescriptions" && (
                    <div className="space-y-3">
                        {rxLoading ? <Loader /> : !prescriptions?.length ? (
                            <p className="text-sm text-slate-400 text-center py-8">No prescriptions found.</p>
                        ) : prescriptions.map((rx) => (
                            <div key={rx._id} className="p-3 bg-slate-50 rounded-xl space-y-2">
                                <div className="flex items-center justify-between">
                                    <p className="text-sm font-medium text-slate-700">Dr. {rx.doctor?.user?.name}</p>
                                    <p className="text-xs text-slate-400">{formatDate(rx.createdAt)}</p>
                                </div>
                                <p className="text-xs text-slate-600">
                                    <span className="font-medium">Diagnosis:</span> {rx.diagnosis}
                                </p>
                                <div className="flex flex-wrap gap-1">
                                    {rx.medicines?.map((med, i) => (
                                        <span key={i} className="px-2 py-0.5 bg-sky-50 text-sky-600 text-xs rounded-full">
                                            {med.name}
                                        </span>
                                    ))}
                                </div>
                                <Button
                                    variant="outline"
                                    size="sm"
                                    onClick={() => window.open(`${import.meta.env.VITE_API_URL}/prescriptions/${rx._id}/pdf`, "_blank")}
                                >
                                    Download PDF
                                </Button>
                            </div>
                        ))}
                    </div>
                )}

                {/* Lab */}
                {activeTab === "lab" && (
                    <div className="space-y-3">
                        {labLoading ? <Loader /> : !labTests?.length ? (
                            <p className="text-sm text-slate-400 text-center py-8">No lab tests found.</p>
                        ) : labTests.map((test) => (
                            <div key={test._id} className="flex items-center justify-between p-3 bg-slate-50 rounded-xl">
                                <div className="flex items-center gap-3">
                                    <FlaskConical size={16} className="text-slate-400 shrink-0" />
                                    <div>
                                        <p className="text-sm font-medium text-slate-700">{test.testName}</p>
                                        <p className="text-xs text-slate-400">{formatDate(test.createdAt)}</p>
                                    </div>
                                </div>
                                <div className="text-right">
                                    <Badge label={test.status} className="bg-blue-100 text-blue-700" />
                                    <p className="text-xs text-slate-500 mt-1">₹{test.price}</p>
                                </div>
                            </div>
                        ))}
                    </div>
                )}

                {/* Billing */}
                {activeTab === "billing" && (
                    <div className="space-y-3">
                        {billLoading ? <Loader /> : !bills?.length ? (
                            <p className="text-sm text-slate-400 text-center py-8">No bills found.</p>
                        ) : bills.map((bill) => (
                            <div key={bill._id} className="flex items-center justify-between p-3 bg-slate-50 rounded-xl">
                                <div className="flex items-center gap-3">
                                    <Receipt size={16} className="text-slate-400 shrink-0" />
                                    <div>
                                        <p className="text-sm font-medium text-slate-700 font-mono">{bill.billNo}</p>
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

            </div>
        </div>
    );
};

export default PatientDetail;