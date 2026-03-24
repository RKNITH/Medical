import { useState } from "react";
import { useSelector } from "react-redux";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import api from "../../api/axios.js";
import useFetch from "../../hooks/useFetch.js";
import {
    Plus, BedDouble, Filter, X,
    Edit, Trash2, User, AlertTriangle,
} from "lucide-react";
import Button from "../../components/common/Button.jsx";
import Badge from "../../components/common/Badge.jsx";
import Modal from "../../components/common/Modal.jsx";
import Loader from "../../components/common/Loader.jsx";
import { BED_STATUS_COLOR } from "../../utils/constants.js";
import { formatDate } from "../../utils/formatDate.js";

const schema = z.object({
    bedNumber: z.string().min(1, "Bed number is required."),
    ward: z.string().min(1, "Ward is required."),
    type: z.enum(["general", "semi_private", "private", "icu"]),
    pricePerDay: z.coerce.number().min(1, "Price is required."),
});

const inputClass = (hasError) =>
    `w-full px-3 py-2.5 rounded-lg border text-sm text-slate-800 outline-none transition-all
   focus:ring-2 focus:ring-sky-500 focus:border-sky-500 bg-slate-50
   ${hasError ? "border-red-400 bg-red-50" : "border-slate-200"}`;

const Field = ({ label, error, children }) => (
    <div>
        <label className="block text-sm font-medium text-slate-700 mb-1.5">{label}</label>
        {children}
        {error && <p className="text-xs text-red-500 mt-1">{error}</p>}
    </div>
);

const BED_TYPES = ["general", "semi_private", "private", "icu"];
const BED_TYPE_COLOR = {
    general: "bg-slate-100 text-slate-600",
    semi_private: "bg-blue-100 text-blue-700",
    private: "bg-violet-100 text-violet-700",
    icu: "bg-red-100 text-red-700",
};

// ── Bed Card ──────────────────────────────────────────────────
const BedCard = ({ bed, canManage, canDelete, onEdit, onDelete, onAssign, onRelease }) => (
    <div className={`bg-white rounded-2xl border shadow-sm p-4 space-y-3 transition-all
    ${bed.status === "available" ? "border-emerald-100" :
            bed.status === "occupied" ? "border-amber-100" : "border-slate-200"}`}
    >
        {/* Top Row */}
        <div className="flex items-start justify-between">
            <div className="flex items-center gap-2">
                <div className={`w-10 h-10 rounded-xl flex items-center justify-center shrink-0
          ${bed.status === "available" ? "bg-emerald-50" :
                        bed.status === "occupied" ? "bg-amber-50" : "bg-slate-100"}`}
                >
                    <BedDouble size={18} className={
                        bed.status === "available" ? "text-emerald-500" :
                            bed.status === "occupied" ? "text-amber-500" : "text-slate-400"
                    } />
                </div>
                <div>
                    <p className="text-sm font-bold text-slate-800">Bed {bed.bedNumber}</p>
                    <p className="text-xs text-slate-400">{bed.ward}</p>
                </div>
            </div>
            <Badge label={bed.status} className={BED_STATUS_COLOR[bed.status]} />
        </div>

        {/* Info */}
        <div className="grid grid-cols-2 gap-2">
            <div className="p-2 bg-slate-50 rounded-lg">
                <p className="text-xs text-slate-400">Type</p>
                <span className={`text-xs font-medium capitalize px-2 py-0.5 rounded-full ${BED_TYPE_COLOR[bed.type]}`}>
                    {bed.type.replace(/_/g, " ")}
                </span>
            </div>
            <div className="p-2 bg-slate-50 rounded-lg">
                <p className="text-xs text-slate-400">Price/Day</p>
                <p className="text-sm font-semibold text-slate-700">₹{bed.pricePerDay}</p>
            </div>
        </div>

        {/* Assigned Patient */}
        {bed.status === "occupied" && bed.assignedPatient && (
            <div className="flex items-center gap-2 p-2.5 bg-amber-50 rounded-xl">
                <User size={14} className="text-amber-500 shrink-0" />
                <div>
                    <p className="text-xs font-medium text-amber-700">{bed.assignedPatient?.user?.name}</p>
                    <p className="text-xs text-amber-500">Since {formatDate(bed.admittedAt)}</p>
                </div>
            </div>
        )}

        {/* Actions */}
        {canManage && (
            <div className="flex flex-wrap gap-2 pt-1">
                {bed.status === "available" && (
                    <Button variant="primary" size="sm" className="flex-1" onClick={() => onAssign(bed)}>
                        Assign Patient
                    </Button>
                )}
                {bed.status === "occupied" && (
                    <Button variant="outline" size="sm" className="flex-1" onClick={() => onRelease(bed)}>
                        Release Bed
                    </Button>
                )}
                <Button variant="ghost" size="sm" onClick={() => onEdit(bed)}>
                    <Edit size={14} />
                </Button>
                {canDelete && (
                    <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => onDelete(bed)}
                        className="text-red-400 hover:text-red-600 hover:bg-red-50"
                    >
                        <Trash2 size={14} />
                    </Button>
                )}
            </div>
        )}
    </div>
);

const BedManagement = () => {
    const { user } = useSelector((state) => state.auth);

    const canManage = ["super_admin", "admin", "nurse", "receptionist"].includes(user?.role);
    const canDelete = ["super_admin", "admin"].includes(user?.role);

    const [filterStatus, setFilterStatus] = useState("");
    const [filterType, setFilterType] = useState("");
    const [filterWard, setFilterWard] = useState("");

    const [addModal, setAddModal] = useState(false);
    const [editModal, setEditModal] = useState({ open: false, bed: null });
    const [deleteModal, setDeleteModal] = useState({ open: false, bed: null });
    const [assignModal, setAssignModal] = useState({ open: false, bed: null });
    const [releaseModal, setReleaseModal] = useState({ open: false, bed: null });

    const [submitting, setSubmitting] = useState(false);
    const [submitError, setSubmitError] = useState(null);
    const [deleting, setDeleting] = useState(false);
    const [assigning, setAssigning] = useState(false);
    const [releasing, setReleasing] = useState(false);
    const [selectedPatient, setSelectedPatient] = useState("");

    const { data: bedsData, loading, refetch } = useFetch("/beds");
    const { data: patientsData } = useFetch("/patients", { limit: 100 });

    const { register, handleSubmit, reset, setValue, formState: { errors } } = useForm({
        resolver: zodResolver(schema),
    });

    // ── Derived stats ─────────────────────────────────────────
    const beds = bedsData || [];
    const available = beds.filter((b) => b.status === "available").length;
    const occupied = beds.filter((b) => b.status === "occupied").length;
    const maintenance = beds.filter((b) => b.status === "maintenance").length;

    // ── Filtered beds ──────────────────────────────────────────
    const filteredBeds = beds.filter((b) => {
        if (filterStatus && b.status !== filterStatus) return false;
        if (filterType && b.type !== filterType) return false;
        if (filterWard && !b.ward.toLowerCase().includes(filterWard.toLowerCase())) return false;
        return true;
    });

    const clearFilters = () => {
        setFilterStatus("");
        setFilterType("");
        setFilterWard("");
    };

    // ── Add ────────────────────────────────────────────────────
    const onAdd = async (data) => {
        setSubmitting(true);
        setSubmitError(null);
        try {
            await api.post("/beds", data);
            reset();
            setAddModal(false);
            refetch();
        } catch (err) {
            setSubmitError(err.response?.data?.message || "Failed to add bed.");
        } finally {
            setSubmitting(false);
        }
    };

    // ── Edit ───────────────────────────────────────────────────
    const onEdit = async (data) => {
        setSubmitting(true);
        setSubmitError(null);
        try {
            await api.put(`/beds/${editModal.bed._id}`, data);
            setEditModal({ open: false, bed: null });
            refetch();
        } catch (err) {
            setSubmitError(err.response?.data?.message || "Failed to update bed.");
        } finally {
            setSubmitting(false);
        }
    };

    const openEdit = (bed) => {
        setEditModal({ open: true, bed });
        setSubmitError(null);
        setValue("bedNumber", bed.bedNumber);
        setValue("ward", bed.ward);
        setValue("type", bed.type);
        setValue("pricePerDay", bed.pricePerDay);
    };

    // ── Delete ─────────────────────────────────────────────────
    const handleDelete = async () => {
        setDeleting(true);
        try {
            await api.delete(`/beds/${deleteModal.bed._id}`);
            refetch();
            setDeleteModal({ open: false, bed: null });
        } catch (err) {
            console.error(err);
        } finally {
            setDeleting(false);
        }
    };

    // ── Assign Patient ─────────────────────────────────────────
    const handleAssign = async () => {
        if (!selectedPatient) return;
        setAssigning(true);
        try {
            await api.put(`/beds/${assignModal.bed._id}`, {
                status: "occupied",
                assignedPatient: selectedPatient,
                admittedAt: new Date(),
            });
            // Mark patient as admitted
            await api.put(`/patients/${selectedPatient}`, { isAdmitted: true, assignedBed: assignModal.bed._id });
            refetch();
            setAssignModal({ open: false, bed: null });
            setSelectedPatient("");
        } catch (err) {
            console.error(err);
        } finally {
            setAssigning(false);
        }
    };

    // ── Release Bed ────────────────────────────────────────────
    const handleRelease = async () => {
        setReleasing(true);
        try {
            const patientId = releaseModal.bed.assignedPatient?._id;
            await api.put(`/beds/${releaseModal.bed._id}`, {
                status: "available",
                assignedPatient: null,
                admittedAt: null,
            });
            if (patientId) {
                await api.put(`/patients/${patientId}`, { isAdmitted: false, assignedBed: null });
            }
            refetch();
            setReleaseModal({ open: false, bed: null });
        } catch (err) {
            console.error(err);
        } finally {
            setReleasing(false);
        }
    };

    const BedForm = ({ onSubmitFn, submitLabel }) => (
        <form onSubmit={handleSubmit(onSubmitFn)} className="space-y-4">
            {submitError && (
                <div className="px-4 py-3 bg-red-50 border border-red-200 rounded-lg text-red-600 text-sm">
                    {submitError}
                </div>
            )}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <Field label="Bed Number" error={errors.bedNumber?.message}>
                    <input {...register("bedNumber")} placeholder="e.g. A-101" className={inputClass(errors.bedNumber)} />
                </Field>
                <Field label="Ward" error={errors.ward?.message}>
                    <input {...register("ward")} placeholder="e.g. General Ward" className={inputClass(errors.ward)} />
                </Field>
                <Field label="Bed Type" error={errors.type?.message}>
                    <select {...register("type")} className={inputClass(errors.type)}>
                        <option value="">Select type</option>
                        {BED_TYPES.map((t) => (
                            <option key={t} value={t} className="capitalize">{t.replace(/_/g, " ")}</option>
                        ))}
                    </select>
                </Field>
                <Field label="Price Per Day (₹)" error={errors.pricePerDay?.message}>
                    <input {...register("pricePerDay")} type="number" placeholder="500" className={inputClass(errors.pricePerDay)} />
                </Field>
            </div>
            <div className="flex items-center gap-3 justify-end pt-2">
                <Button
                    variant="outline"
                    type="button"
                    onClick={() => {
                        addModal ? setAddModal(false) : setEditModal({ open: false, bed: null });
                        reset();
                        setSubmitError(null);
                    }}
                >
                    Cancel
                </Button>
                <Button type="submit" variant="primary" loading={submitting}>{submitLabel}</Button>
            </div>
        </form>
    );

    return (
        <div className="space-y-5">

            {/* Header */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                <div>
                    <h1 className="text-2xl font-bold text-slate-800">Bed Management</h1>
                    <p className="text-sm text-slate-500 mt-0.5">{beds.length} total beds</p>
                </div>
                {canManage && (
                    <Button
                        variant="primary"
                        icon={Plus}
                        onClick={() => { setAddModal(true); reset(); setSubmitError(null); }}
                    >
                        Add Bed
                    </Button>
                )}
            </div>

            {/* Stats */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                {[
                    { label: "Total Beds", value: beds.length, color: "bg-sky-50 text-sky-700", dot: "bg-sky-400" },
                    { label: "Available", value: available, color: "bg-emerald-50 text-emerald-700", dot: "bg-emerald-400" },
                    { label: "Occupied", value: occupied, color: "bg-amber-50 text-amber-700", dot: "bg-amber-400" },
                    { label: "Maintenance", value: maintenance, color: "bg-slate-100 text-slate-600", dot: "bg-slate-400" },
                ].map((stat) => (
                    <div key={stat.label} className={`flex items-center gap-3 p-4 rounded-2xl border border-slate-100 bg-white shadow-sm`}>
                        <div className={`w-2.5 h-2.5 rounded-full shrink-0 ${stat.dot}`} />
                        <div>
                            <p className="text-xs text-slate-500">{stat.label}</p>
                            <p className="text-2xl font-bold text-slate-800">{stat.value}</p>
                        </div>
                    </div>
                ))}
            </div>

            {/* Occupancy Bar */}
            {beds.length > 0 && (
                <div className="bg-white rounded-2xl border border-slate-100 shadow-sm p-4">
                    <div className="flex items-center justify-between mb-2">
                        <p className="text-sm font-medium text-slate-700">Occupancy Rate</p>
                        <p className="text-sm font-bold text-slate-800">
                            {beds.length > 0 ? ((occupied / beds.length) * 100).toFixed(1) : 0}%
                        </p>
                    </div>
                    <div className="w-full h-3 bg-slate-100 rounded-full overflow-hidden">
                        <div
                            className="h-full bg-gradient-to-r from-sky-400 to-sky-500 rounded-full transition-all duration-500"
                            style={{ width: `${beds.length > 0 ? (occupied / beds.length) * 100 : 0}%` }}
                        />
                    </div>
                    <div className="flex items-center gap-4 mt-2">
                        <div className="flex items-center gap-1.5">
                            <div className="w-2 h-2 rounded-full bg-sky-400" />
                            <span className="text-xs text-slate-500">Occupied ({occupied})</span>
                        </div>
                        <div className="flex items-center gap-1.5">
                            <div className="w-2 h-2 rounded-full bg-slate-200" />
                            <span className="text-xs text-slate-500">Available ({available})</span>
                        </div>
                    </div>
                </div>
            )}

            {/* Filters */}
            <div className="bg-white rounded-2xl border border-slate-100 shadow-sm p-4">
                <div className="flex flex-wrap gap-3 items-center">
                    <div className="flex items-center gap-2 text-slate-500">
                        <Filter size={15} />
                        <span className="text-sm font-medium">Filter:</span>
                    </div>
                    <select
                        value={filterStatus}
                        onChange={(e) => setFilterStatus(e.target.value)}
                        className="px-3 py-2 rounded-lg border border-slate-200 text-sm text-slate-700 outline-none focus:ring-2 focus:ring-sky-500 bg-slate-50"
                    >
                        <option value="">All Status</option>
                        <option value="available">Available</option>
                        <option value="occupied">Occupied</option>
                        <option value="maintenance">Maintenance</option>
                    </select>
                    <select
                        value={filterType}
                        onChange={(e) => setFilterType(e.target.value)}
                        className="px-3 py-2 rounded-lg border border-slate-200 text-sm text-slate-700 outline-none focus:ring-2 focus:ring-sky-500 bg-slate-50"
                    >
                        <option value="">All Types</option>
                        {BED_TYPES.map((t) => (
                            <option key={t} value={t} className="capitalize">{t.replace(/_/g, " ")}</option>
                        ))}
                    </select>
                    <input
                        type="text"
                        placeholder="Filter by ward..."
                        value={filterWard}
                        onChange={(e) => setFilterWard(e.target.value)}
                        className="px-3 py-2 rounded-lg border border-slate-200 text-sm text-slate-700 outline-none focus:ring-2 focus:ring-sky-500 bg-slate-50"
                    />
                    {(filterStatus || filterType || filterWard) && (
                        <Button variant="ghost" size="sm" icon={X} onClick={clearFilters}>Clear</Button>
                    )}
                </div>
            </div>

            {/* Bed Grid */}
            {loading ? (
                <div className="h-64 flex items-center justify-center"><Loader size="lg" /></div>
            ) : filteredBeds.length === 0 ? (
                <div className="bg-white rounded-2xl border border-slate-100 shadow-sm p-12 flex flex-col items-center gap-3">
                    <div className="w-14 h-14 rounded-2xl bg-slate-50 flex items-center justify-center">
                        <BedDouble size={28} className="text-slate-300" />
                    </div>
                    <p className="text-slate-500 text-sm">No beds found.</p>
                </div>
            ) : (
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
                    {filteredBeds.map((bed) => (
                        <BedCard
                            key={bed._id}
                            bed={bed}
                            canManage={canManage}
                            canDelete={canDelete}
                            onEdit={openEdit}
                            onDelete={(bed) => setDeleteModal({ open: true, bed })}
                            onAssign={(bed) => setAssignModal({ open: true, bed })}
                            onRelease={(bed) => setReleaseModal({ open: true, bed })}
                        />
                    ))}
                </div>
            )}

            {/* Add Modal */}
            <Modal
                isOpen={addModal}
                onClose={() => { setAddModal(false); reset(); setSubmitError(null); }}
                title="Add New Bed"
                size="md"
            >
                <BedForm onSubmitFn={onAdd} submitLabel="Add Bed" />
            </Modal>

            {/* Edit Modal */}
            <Modal
                isOpen={editModal.open}
                onClose={() => { setEditModal({ open: false, bed: null }); reset(); setSubmitError(null); }}
                title="Edit Bed"
                size="md"
            >
                <BedForm onSubmitFn={onEdit} submitLabel="Save Changes" />
            </Modal>

            {/* Delete Modal */}
            <Modal
                isOpen={deleteModal.open}
                onClose={() => setDeleteModal({ open: false, bed: null })}
                title="Delete Bed"
                size="sm"
            >
                <div className="space-y-4">
                    <div className="flex items-start gap-3 p-3 bg-red-50 rounded-xl">
                        <AlertTriangle size={18} className="text-red-500 shrink-0 mt-0.5" />
                        <p className="text-sm text-red-700">
                            Are you sure you want to delete bed{" "}
                            <span className="font-bold">{deleteModal.bed?.bedNumber}</span>? This cannot be undone.
                        </p>
                    </div>
                    <div className="flex gap-3 justify-end">
                        <Button variant="outline" onClick={() => setDeleteModal({ open: false, bed: null })}>Cancel</Button>
                        <Button variant="danger" loading={deleting} onClick={handleDelete}>Delete Bed</Button>
                    </div>
                </div>
            </Modal>

            {/* Assign Patient Modal */}
            <Modal
                isOpen={assignModal.open}
                onClose={() => { setAssignModal({ open: false, bed: null }); setSelectedPatient(""); }}
                title={`Assign Patient — Bed ${assignModal.bed?.bedNumber}`}
                size="sm"
            >
                <div className="space-y-4">
                    <div className="grid grid-cols-2 gap-3">
                        <div className="p-3 bg-slate-50 rounded-xl">
                            <p className="text-xs text-slate-400">Ward</p>
                            <p className="text-sm font-medium text-slate-700">{assignModal.bed?.ward}</p>
                        </div>
                        <div className="p-3 bg-slate-50 rounded-xl">
                            <p className="text-xs text-slate-400">Price/Day</p>
                            <p className="text-sm font-medium text-slate-700">₹{assignModal.bed?.pricePerDay}</p>
                        </div>
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-slate-700 mb-1.5">Select Patient</label>
                        <select
                            value={selectedPatient}
                            onChange={(e) => setSelectedPatient(e.target.value)}
                            className="w-full px-3 py-2.5 rounded-lg border border-slate-200 text-sm text-slate-800 outline-none focus:ring-2 focus:ring-sky-500 bg-slate-50"
                        >
                            <option value="">Select patient</option>
                            {patientsData?.patients
                                ?.filter((p) => !p.isAdmitted)
                                .map((p) => (
                                    <option key={p._id} value={p._id}>
                                        {p.user?.name} — {p.patientId}
                                    </option>
                                ))}
                        </select>
                    </div>
                    <div className="flex gap-3 justify-end">
                        <Button variant="outline" onClick={() => { setAssignModal({ open: false, bed: null }); setSelectedPatient(""); }}>
                            Cancel
                        </Button>
                        <Button
                            variant="primary"
                            loading={assigning}
                            disabled={!selectedPatient}
                            onClick={handleAssign}
                        >
                            Assign Patient
                        </Button>
                    </div>
                </div>
            </Modal>

            {/* Release Bed Modal */}
            <Modal
                isOpen={releaseModal.open}
                onClose={() => setReleaseModal({ open: false, bed: null })}
                title={`Release Bed — ${releaseModal.bed?.bedNumber}`}
                size="sm"
            >
                <div className="space-y-4">
                    {releaseModal.bed?.assignedPatient && (
                        <div className="flex items-center gap-3 p-3 bg-amber-50 rounded-xl">
                            <User size={16} className="text-amber-500 shrink-0" />
                            <div>
                                <p className="text-sm font-medium text-amber-700">
                                    {releaseModal.bed.assignedPatient?.user?.name}
                                </p>
                                <p className="text-xs text-amber-500">
                                    Admitted since {formatDate(releaseModal.bed.admittedAt)}
                                </p>
                            </div>
                        </div>
                    )}
                    <p className="text-sm text-slate-600">
                        Releasing this bed will mark it as available and discharge the assigned patient.
                    </p>
                    <div className="flex gap-3 justify-end">
                        <Button variant="outline" onClick={() => setReleaseModal({ open: false, bed: null })}>Cancel</Button>
                        <Button variant="success" loading={releasing} onClick={handleRelease}>
                            Release Bed
                        </Button>
                    </div>
                </div>
            </Modal>

        </div>
    );
};

export default BedManagement;