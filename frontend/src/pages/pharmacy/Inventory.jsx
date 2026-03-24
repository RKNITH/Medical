import { useState } from "react";
import { useSelector } from "react-redux";
import { useNavigate } from "react-router-dom";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import api from "../../api/axios.js";
import useFetch from "../../hooks/useFetch.js";
import {
    Plus, Pill, Search, Filter,
    X, Edit, Trash2, AlertTriangle,
    PackagePlus, PackageMinus,
} from "lucide-react";
import Button from "../../components/common/Button.jsx";
import Table from "../../components/common/Table.jsx";
import Badge from "../../components/common/Badge.jsx";
import Modal from "../../components/common/Modal.jsx";
import Loader from "../../components/common/Loader.jsx";
import { formatDate } from "../../utils/formatDate.js";

const schema = z.object({
    name: z.string().min(2, "Name is required."),
    genericName: z.string().optional(),
    category: z.string().optional(),
    manufacturer: z.string().optional(),
    stock: z.coerce.number().min(0, "Stock must be 0 or more."),
    unit: z.enum(["tablet", "capsule", "syrup", "injection", "drops", "cream", "other"]),
    price: z.coerce.number().min(1, "Price is required."),
    expiryDate: z.string().min(1, "Expiry date is required."),
    batchNumber: z.string().optional(),
    reorderLevel: z.coerce.number().min(0).optional(),
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

const UNITS = ["tablet", "capsule", "syrup", "injection", "drops", "cream", "other"];

const Inventory = () => {
    const { user } = useSelector((state) => state.auth);
    const navigate = useNavigate();

    const canManage = ["super_admin", "admin", "pharmacist"].includes(user?.role);
    const canDelete = ["super_admin", "admin"].includes(user?.role);

    const [search, setSearch] = useState("");
    const [category, setCategory] = useState("");
    const [lowStock, setLowStock] = useState(false);
    const [page, setPage] = useState(1);
    const limit = 10;

    const [addModal, setAddModal] = useState(false);
    const [editModal, setEditModal] = useState({ open: false, medicine: null });
    const [stockModal, setStockModal] = useState({ open: false, id: null, name: "" });
    const [deleteModal, setDeleteModal] = useState({ open: false, id: null });
    const [submitting, setSubmitting] = useState(false);
    const [submitError, setSubmitError] = useState(null);
    const [stockAction, setStockAction] = useState("add");
    const [stockQty, setStockQty] = useState(1);
    const [stockUpdating, setStockUpdating] = useState(false);
    const [deleting, setDeleting] = useState(false);

    const { data, loading, refetch } = useFetch("/pharmacy", {
        search, category, lowStock: lowStock ? "true" : "", page, limit,
    });

    const { register, handleSubmit, reset, setValue, formState: { errors } } = useForm({
        resolver: zodResolver(schema),
    });

    const onAdd = async (formData) => {
        setSubmitting(true);
        setSubmitError(null);
        try {
            await api.post("/pharmacy", formData);
            reset();
            setAddModal(false);
            refetch();
        } catch (err) {
            setSubmitError(err.response?.data?.message || "Failed to add medicine.");
        } finally {
            setSubmitting(false);
        }
    };

    const onEdit = async (formData) => {
        setSubmitting(true);
        setSubmitError(null);
        try {
            await api.put(`/pharmacy/${editModal.medicine._id}`, formData);
            setEditModal({ open: false, medicine: null });
            refetch();
        } catch (err) {
            setSubmitError(err.response?.data?.message || "Failed to update medicine.");
        } finally {
            setSubmitting(false);
        }
    };

    const openEdit = (med) => {
        setEditModal({ open: true, medicine: med });
        setSubmitError(null);
        Object.entries({
            name: med.name,
            genericName: med.genericName || "",
            category: med.category || "",
            manufacturer: med.manufacturer || "",
            stock: med.stock,
            unit: med.unit,
            price: med.price,
            expiryDate: med.expiryDate?.split("T")[0],
            batchNumber: med.batchNumber || "",
            reorderLevel: med.reorderLevel,
        }).forEach(([k, v]) => setValue(k, v));
    };

    const handleStockUpdate = async () => {
        setStockUpdating(true);
        try {
            await api.put(`/pharmacy/${stockModal.id}/stock`, {
                quantity: Number(stockQty),
                action: stockAction,
            });
            refetch();
            setStockModal({ open: false, id: null, name: "" });
            setStockQty(1);
        } catch (err) {
            console.error(err);
        } finally {
            setStockUpdating(false);
        }
    };

    const handleDelete = async () => {
        setDeleting(true);
        try {
            await api.delete(`/pharmacy/${deleteModal.id}`);
            refetch();
            setDeleteModal({ open: false, id: null });
        } catch (err) {
            console.error(err);
        } finally {
            setDeleting(false);
        }
    };

    const totalPages = Math.ceil((data?.total || 0) / limit);

    const columns = [
        {
            key: "name",
            label: "Medicine",
            render: (row) => (
                <div className="flex items-center gap-2.5">
                    <div className="w-8 h-8 rounded-lg bg-emerald-50 flex items-center justify-center shrink-0">
                        <Pill size={15} className="text-emerald-500" />
                    </div>
                    <div>
                        <p className="text-sm font-medium text-slate-800">{row.name}</p>
                        {row.genericName && (
                            <p className="text-xs text-slate-400">{row.genericName}</p>
                        )}
                    </div>
                </div>
            ),
        },
        {
            key: "category",
            label: "Category",
            render: (row) => (
                <span className="text-sm text-slate-600">{row.category || "—"}</span>
            ),
        },
        {
            key: "unit",
            label: "Unit",
            render: (row) => (
                <span className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium bg-slate-100 text-slate-600 capitalize">
                    {row.unit}
                </span>
            ),
        },
        {
            key: "stock",
            label: "Stock",
            render: (row) => (
                <div className="flex items-center gap-1.5">
                    {row.stock <= row.reorderLevel && (
                        <AlertTriangle size={13} className="text-amber-500 shrink-0" />
                    )}
                    <span className={`text-sm font-semibold ${row.stock <= row.reorderLevel ? "text-amber-600" : "text-slate-700"}`}>
                        {row.stock}
                    </span>
                    <span className="text-xs text-slate-400">units</span>
                </div>
            ),
        },
        {
            key: "price",
            label: "Price",
            render: (row) => (
                <span className="text-sm font-semibold text-slate-700">₹{row.price}</span>
            ),
        },
        {
            key: "expiryDate",
            label: "Expiry",
            render: (row) => {
                const isExpiringSoon = new Date(row.expiryDate) < new Date(Date.now() + 30 * 24 * 60 * 60 * 1000);
                return (
                    <span className={`text-sm ${isExpiringSoon ? "text-red-500 font-medium" : "text-slate-600"}`}>
                        {formatDate(row.expiryDate)}
                    </span>
                );
            },
        },
        {
            key: "isAvailable",
            label: "Status",
            render: (row) => (
                <Badge
                    label={row.isAvailable ? "Available" : "Out of Stock"}
                    className={row.isAvailable ? "bg-green-100 text-green-700" : "bg-red-100 text-red-700"}
                />
            ),
        },
        {
            key: "actions",
            label: "Actions",
            render: (row) => (
                <div className="flex items-center gap-2">
                    {canManage && (
                        <>
                            <Button
                                variant="ghost"
                                size="sm"
                                onClick={() => setStockModal({ open: true, id: row._id, name: row.name })}
                            >
                                <PackagePlus size={15} />
                            </Button>
                            <Button
                                variant="ghost"
                                size="sm"
                                onClick={() => openEdit(row)}
                            >
                                <Edit size={15} />
                            </Button>
                        </>
                    )}
                    {canDelete && (
                        <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => setDeleteModal({ open: true, id: row._id })}
                            className="text-red-400 hover:text-red-600 hover:bg-red-50"
                        >
                            <Trash2 size={15} />
                        </Button>
                    )}
                </div>
            ),
        },
    ];

    const MedicineForm = ({ onSubmitFn, submitLabel }) => (
        <form onSubmit={handleSubmit(onSubmitFn)} className="space-y-4">
            {submitError && (
                <div className="px-4 py-3 bg-red-50 border border-red-200 rounded-lg text-red-600 text-sm">
                    {submitError}
                </div>
            )}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <Field label="Medicine Name" error={errors.name?.message}>
                    <input {...register("name")} placeholder="Paracetamol" className={inputClass(errors.name)} />
                </Field>
                <Field label="Generic Name">
                    <input {...register("genericName")} placeholder="Acetaminophen" className={inputClass(false)} />
                </Field>
                <Field label="Category">
                    <input {...register("category")} placeholder="Analgesic" className={inputClass(false)} />
                </Field>
                <Field label="Manufacturer">
                    <input {...register("manufacturer")} placeholder="Sun Pharma" className={inputClass(false)} />
                </Field>
                <Field label="Unit" error={errors.unit?.message}>
                    <select {...register("unit")} className={inputClass(errors.unit)}>
                        <option value="">Select unit</option>
                        {UNITS.map((u) => (
                            <option key={u} value={u} className="capitalize">{u}</option>
                        ))}
                    </select>
                </Field>
                <Field label="Stock" error={errors.stock?.message}>
                    <input {...register("stock")} type="number" placeholder="100" className={inputClass(errors.stock)} />
                </Field>
                <Field label="Price (₹)" error={errors.price?.message}>
                    <input {...register("price")} type="number" placeholder="10" className={inputClass(errors.price)} />
                </Field>
                <Field label="Expiry Date" error={errors.expiryDate?.message}>
                    <input {...register("expiryDate")} type="date" className={inputClass(errors.expiryDate)} />
                </Field>
                <Field label="Batch Number">
                    <input {...register("batchNumber")} placeholder="BATCH-001" className={inputClass(false)} />
                </Field>
                <Field label="Reorder Level">
                    <input {...register("reorderLevel")} type="number" placeholder="10" className={inputClass(false)} />
                </Field>
            </div>
            <div className="flex items-center gap-3 justify-end pt-2">
                <Button
                    variant="outline"
                    type="button"
                    onClick={() => {
                        addModal ? setAddModal(false) : setEditModal({ open: false, medicine: null });
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
                    <h1 className="text-2xl font-bold text-slate-800">Pharmacy Inventory</h1>
                    <p className="text-sm text-slate-500 mt-0.5">{data?.total || 0} medicines in inventory</p>
                </div>
                <div className="flex gap-2">
                    <Button
                        variant="outline"
                        onClick={() => navigate("/pharmacy/dispense")}
                    >
                        Dispense Medicine
                    </Button>
                    {canManage && (
                        <Button variant="primary" icon={Plus} onClick={() => { setAddModal(true); reset(); setSubmitError(null); }}>
                            Add Medicine
                        </Button>
                    )}
                </div>
            </div>

            {/* Low Stock Alert */}
            {data?.medicines?.some((m) => m.stock <= m.reorderLevel) && (
                <div className="flex items-center gap-3 px-4 py-3 bg-amber-50 border border-amber-200 rounded-xl">
                    <AlertTriangle size={18} className="text-amber-500 shrink-0" />
                    <p className="text-sm text-amber-700">
                        Some medicines are running low on stock. Check items with{" "}
                        <button
                            onClick={() => setLowStock(true)}
                            className="font-semibold underline"
                        >
                            low stock filter
                        </button>.
                    </p>
                </div>
            )}

            {/* Filters */}
            <div className="bg-white rounded-2xl border border-slate-100 shadow-sm p-4">
                <div className="flex flex-wrap gap-3 items-center">
                    <div className="relative flex-1 min-w-48 max-w-sm">
                        <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
                        <input
                            type="text"
                            placeholder="Search medicines..."
                            value={search}
                            onChange={(e) => { setSearch(e.target.value); setPage(1); }}
                            className="w-full pl-9 pr-4 py-2 rounded-lg border border-slate-200 text-sm text-slate-700 outline-none focus:ring-2 focus:ring-sky-500 bg-slate-50"
                        />
                    </div>
                    <input
                        type="text"
                        placeholder="Filter by category"
                        value={category}
                        onChange={(e) => { setCategory(e.target.value); setPage(1); }}
                        className="px-3 py-2 rounded-lg border border-slate-200 text-sm text-slate-700 outline-none focus:ring-2 focus:ring-sky-500 bg-slate-50"
                    />
                    <button
                        onClick={() => setLowStock(!lowStock)}
                        className={`flex items-center gap-2 px-3 py-2 rounded-lg border text-sm font-medium transition-colors
              ${lowStock
                                ? "bg-amber-500 text-white border-amber-500"
                                : "border-slate-200 text-slate-600 hover:bg-slate-50"}`}
                    >
                        <AlertTriangle size={14} />
                        Low Stock
                    </button>
                    {(search || category || lowStock) && (
                        <Button
                            variant="ghost"
                            size="sm"
                            icon={X}
                            onClick={() => { setSearch(""); setCategory(""); setLowStock(false); setPage(1); }}
                        >
                            Clear
                        </Button>
                    )}
                </div>
            </div>

            {/* Table */}
            <Table
                columns={columns}
                data={data?.medicines || []}
                loading={loading}
                emptyMessage="No medicines found."
            />

            {/* Pagination */}
            {totalPages > 1 && (
                <div className="flex items-center justify-between px-1">
                    <p className="text-sm text-slate-500">Page {page} of {totalPages}</p>
                    <div className="flex gap-2">
                        <Button variant="outline" size="sm" disabled={page === 1} onClick={() => setPage(page - 1)}>Previous</Button>
                        <Button variant="outline" size="sm" disabled={page === totalPages} onClick={() => setPage(page + 1)}>Next</Button>
                    </div>
                </div>
            )}

            {/* Add Modal */}
            <Modal
                isOpen={addModal}
                onClose={() => { setAddModal(false); reset(); setSubmitError(null); }}
                title="Add Medicine"
                size="lg"
            >
                <MedicineForm onSubmitFn={onAdd} submitLabel="Add Medicine" />
            </Modal>

            {/* Edit Modal */}
            <Modal
                isOpen={editModal.open}
                onClose={() => { setEditModal({ open: false, medicine: null }); reset(); setSubmitError(null); }}
                title="Edit Medicine"
                size="lg"
            >
                <MedicineForm onSubmitFn={onEdit} submitLabel="Save Changes" />
            </Modal>

            {/* Stock Update Modal */}
            <Modal
                isOpen={stockModal.open}
                onClose={() => setStockModal({ open: false, id: null, name: "" })}
                title="Update Stock"
                size="sm"
            >
                <div className="space-y-4">
                    <p className="text-sm text-slate-600">
                        Update stock for <span className="font-semibold text-slate-800">{stockModal.name}</span>
                    </p>
                    <div className="flex gap-3">
                        <button
                            onClick={() => setStockAction("add")}
                            className={`flex-1 flex items-center justify-center gap-2 py-2.5 rounded-xl border text-sm font-medium transition-colors
                ${stockAction === "add" ? "bg-emerald-500 text-white border-emerald-500" : "border-slate-200 text-slate-600 hover:bg-slate-50"}`}
                        >
                            <PackagePlus size={15} /> Add Stock
                        </button>
                        <button
                            onClick={() => setStockAction("deduct")}
                            className={`flex-1 flex items-center justify-center gap-2 py-2.5 rounded-xl border text-sm font-medium transition-colors
                ${stockAction === "deduct" ? "bg-red-500 text-white border-red-500" : "border-slate-200 text-slate-600 hover:bg-slate-50"}`}
                        >
                            <PackageMinus size={15} /> Deduct Stock
                        </button>
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-slate-700 mb-1.5">Quantity</label>
                        <input
                            type="number"
                            min={1}
                            value={stockQty}
                            onChange={(e) => setStockQty(e.target.value)}
                            className="w-full px-3 py-2.5 rounded-lg border border-slate-200 text-sm text-slate-800 outline-none focus:ring-2 focus:ring-sky-500 bg-slate-50"
                        />
                    </div>
                    <div className="flex gap-3 justify-end">
                        <Button variant="outline" onClick={() => setStockModal({ open: false, id: null, name: "" })}>
                            Cancel
                        </Button>
                        <Button
                            variant={stockAction === "add" ? "success" : "danger"}
                            loading={stockUpdating}
                            onClick={handleStockUpdate}
                        >
                            {stockAction === "add" ? "Add" : "Deduct"} Stock
                        </Button>
                    </div>
                </div>
            </Modal>

            {/* Delete Modal */}
            <Modal
                isOpen={deleteModal.open}
                onClose={() => setDeleteModal({ open: false, id: null })}
                title="Delete Medicine"
                size="sm"
            >
                <div className="space-y-4">
                    <p className="text-sm text-slate-600">
                        Are you sure you want to delete this medicine? This action cannot be undone.
                    </p>
                    <div className="flex gap-3 justify-end">
                        <Button variant="outline" onClick={() => setDeleteModal({ open: false, id: null })}>
                            Cancel
                        </Button>
                        <Button variant="danger" loading={deleting} onClick={handleDelete}>
                            Delete
                        </Button>
                    </div>
                </div>
            </Modal>

        </div>
    );
};

export default Inventory;