import { useState, useEffect } from "react";
import { useSelector } from "react-redux";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import api from "../../api/axios.js";
import useFetch from "../../hooks/useFetch.js";
import {
    Search, X, Plus,
    ToggleLeft, ToggleRight, Trash2,
} from "lucide-react";
import Button from "../../components/common/Button.jsx";
import Table from "../../components/common/Table.jsx";
import Badge from "../../components/common/Badge.jsx";
import Modal from "../../components/common/Modal.jsx";
import { formatDate } from "../../utils/formatDate.js";

const ROLES = [
    "admin", "doctor", "nurse",
    "receptionist", "lab_technician", "pharmacist", "patient",
];

const schema = z.object({
    name: z.string().min(2, "Name is required."),
    email: z.string().email("Valid email required."),
    password: z.string().min(6, "Min 6 characters."),
    role: z.string().min(1, "Role is required."),
    phone: z.string().optional(),
    // doctor extras
    specialization: z.string().optional(),
    department: z.string().optional(),
    consultationFee: z.coerce.number().optional(),
    // patient extras
    age: z.coerce.number().optional(),
    gender: z.string().optional(),
    bloodGroup: z.string().optional(),
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

const ROLE_COLOR = {
    super_admin: "bg-red-100 text-red-700",
    admin: "bg-orange-100 text-orange-700",
    doctor: "bg-violet-100 text-violet-700",
    nurse: "bg-pink-100 text-pink-700",
    receptionist: "bg-sky-100 text-sky-700",
    lab_technician: "bg-teal-100 text-teal-700",
    pharmacist: "bg-emerald-100 text-emerald-700",
    patient: "bg-slate-100 text-slate-600",
};

const BLOOD_GROUPS = ["A+", "A-", "B+", "B-", "AB+", "AB-", "O+", "O-", "Unknown"];
const DEPARTMENTS = ["General", "Cardiology", "Neurology", "Orthopedics", "Pediatrics", "Gynecology", "Dermatology", "ENT", "Ophthalmology", "Psychiatry", "Oncology", "Radiology"];

const UserList = () => {
    const { user: currentUser } = useSelector((state) => state.auth);
    const isSuperAdmin = currentUser?.role === "super_admin";

    const [search, setSearch] = useState("");
    const [filterRole, setFilterRole] = useState("");
    const [page, setPage] = useState(1);
    const limit = 10;

    const [addModal, setAddModal] = useState(false);
    const [deleteModal, setDeleteModal] = useState({ open: false, id: null, name: "" });
    const [submitting, setSubmitting] = useState(false);
    const [submitError, setSubmitError] = useState(null);
    const [deleting, setDeleting] = useState(false);
    const [togglingId, setTogglingId] = useState(null);

    const { data, loading, refetch } = useFetch("/users", { role: filterRole, page, limit });

    const { register, handleSubmit, reset, watch, formState: { errors } } = useForm({
        resolver: zodResolver(schema),
        defaultValues: { role: "" },
    });

    const selectedRole = watch("role");

    const filtered = data?.users?.filter((u) =>
        search
            ? u.name?.toLowerCase().includes(search.toLowerCase()) ||
            u.email?.toLowerCase().includes(search.toLowerCase())
            : true
    );

    const onAdd = async (formData) => {
        setSubmitting(true);
        setSubmitError(null);
        try {
            await api.post("/auth/register", formData);
            reset();
            setAddModal(false);
            refetch();
        } catch (err) {
            setSubmitError(err.response?.data?.message || "Failed to create user.");
        } finally {
            setSubmitting(false);
        }
    };

    const handleToggle = async (id) => {
        setTogglingId(id);
        try {
            await api.put(`/users/${id}/toggle-status`);
            refetch();
        } catch (err) {
            console.error(err);
        } finally {
            setTogglingId(null);
        }
    };

    const handleDelete = async () => {
        setDeleting(true);
        try {
            await api.delete(`/users/${deleteModal.id}`);
            refetch();
            setDeleteModal({ open: false, id: null, name: "" });
        } catch (err) {
            console.error(err);
        } finally {
            setDeleting(false);
        }
    };

    const totalPages = Math.ceil((data?.total || 0) / limit);

    const columns = [
        {
            key: "user",
            label: "User",
            render: (row) => (
                <div className="flex items-center gap-2.5">
                    <div className="w-9 h-9 rounded-full bg-sky-100 flex items-center justify-center text-sky-600 font-semibold text-sm shrink-0 overflow-hidden">
                        {row.avatar
                            ? <img src={row.avatar} alt="" className="w-full h-full object-cover rounded-full" />
                            : row.name?.charAt(0).toUpperCase()
                        }
                    </div>
                    <div>
                        <p className="text-sm font-medium text-slate-800">{row.name}</p>
                        <p className="text-xs text-slate-400">{row.email}</p>
                    </div>
                </div>
            ),
        },
        {
            key: "phone",
            label: "Phone",
            render: (row) => <span className="text-sm text-slate-600">{row.phone || "—"}</span>,
        },
        {
            key: "role",
            label: "Role",
            render: (row) => (
                <Badge label={row.role} className={ROLE_COLOR[row.role] || "bg-slate-100 text-slate-600"} />
            ),
        },
        {
            key: "isActive",
            label: "Status",
            render: (row) => (
                <Badge
                    label={row.isActive ? "Active" : "Inactive"}
                    className={row.isActive ? "bg-green-100 text-green-700" : "bg-red-100 text-red-700"}
                />
            ),
        },
        {
            key: "createdAt",
            label: "Joined",
            render: (row) => <span className="text-sm text-slate-500">{formatDate(row.createdAt)}</span>,
        },
        {
            key: "actions",
            label: "Actions",
            render: (row) => {
                if (row._id === currentUser?._id) {
                    return <span className="text-xs text-slate-400 italic">You</span>;
                }
                return (
                    <div className="flex items-center gap-2">
                        <button
                            onClick={() => handleToggle(row._id)}
                            disabled={togglingId === row._id}
                            className="disabled:opacity-50"
                        >
                            {row.isActive
                                ? <ToggleRight size={22} className="text-emerald-500 hover:text-emerald-600" />
                                : <ToggleLeft size={22} className="text-slate-300 hover:text-slate-400" />
                            }
                        </button>
                        {isSuperAdmin && (
                            <Button
                                variant="ghost"
                                size="sm"
                                onClick={() => setDeleteModal({ open: true, id: row._id, name: row.name })}
                                className="text-red-400 hover:text-red-600 hover:bg-red-50"
                            >
                                <Trash2 size={15} />
                            </Button>
                        )}
                    </div>
                );
            },
        },
    ];

    return (
        <div className="space-y-5">

            {/* Header */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                <div>
                    <h1 className="text-2xl font-bold text-slate-800">Users</h1>
                    <p className="text-sm text-slate-500 mt-0.5">{data?.total || 0} total users</p>
                </div>
                <Button variant="primary" icon={Plus} onClick={() => { setAddModal(true); reset(); setSubmitError(null); }}>
                    Add User
                </Button>
            </div>

            {/* Role Stats */}
            <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-7 gap-3">
                {ROLES.map((role) => {
                    const count = data?.users?.filter((u) => u.role === role).length || 0;
                    return (
                        <button
                            key={role}
                            onClick={() => { setFilterRole(filterRole === role ? "" : role); setPage(1); }}
                            className={`p-3 rounded-xl border text-left transition-all
                ${filterRole === role ? "border-sky-300 bg-sky-50" : "border-slate-100 bg-white hover:border-slate-200"}`}
                        >
                            <p className="text-lg font-bold text-slate-800">{count}</p>
                            <p className="text-xs text-slate-500 capitalize mt-0.5">{role.replace(/_/g, " ")}</p>
                        </button>
                    );
                })}
            </div>

            {/* Filters */}
            <div className="bg-white rounded-2xl border border-slate-100 shadow-sm p-4">
                <div className="flex flex-wrap gap-3 items-center">
                    <div className="relative flex-1 min-w-48 max-w-sm">
                        <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
                        <input
                            type="text"
                            placeholder="Search by name or email..."
                            value={search}
                            onChange={(e) => setSearch(e.target.value)}
                            className="w-full pl-9 pr-4 py-2 rounded-lg border border-slate-200 text-sm outline-none focus:ring-2 focus:ring-sky-500 bg-slate-50"
                        />
                    </div>
                    <select
                        value={filterRole}
                        onChange={(e) => { setFilterRole(e.target.value); setPage(1); }}
                        className="px-3 py-2 rounded-lg border border-slate-200 text-sm outline-none focus:ring-2 focus:ring-sky-500 bg-slate-50"
                    >
                        <option value="">All Roles</option>
                        {ROLES.map((r) => (
                            <option key={r} value={r} className="capitalize">{r.replace(/_/g, " ")}</option>
                        ))}
                    </select>
                    {(search || filterRole) && (
                        <Button variant="ghost" size="sm" icon={X} onClick={() => { setSearch(""); setFilterRole(""); setPage(1); }}>
                            Clear
                        </Button>
                    )}
                </div>
            </div>

            {/* Table */}
            <Table columns={columns} data={filtered || []} loading={loading} emptyMessage="No users found." />

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

            {/* Add User Modal */}
            <Modal
                isOpen={addModal}
                onClose={() => { setAddModal(false); reset(); setSubmitError(null); }}
                title="Add New User"
                size="md"
            >
                <form onSubmit={handleSubmit(onAdd)} className="space-y-4">
                    {submitError && (
                        <div className="px-4 py-3 bg-red-50 border border-red-200 rounded-lg text-red-600 text-sm">
                            {submitError}
                        </div>
                    )}

                    {/* Base fields */}
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                        <Field label="Full Name" error={errors.name?.message}>
                            <input {...register("name")} placeholder="John Doe" className={inputClass(errors.name)} />
                        </Field>
                        <Field label="Email" error={errors.email?.message}>
                            <input {...register("email")} type="email" placeholder="john@example.com" className={inputClass(errors.email)} />
                        </Field>
                        <Field label="Password" error={errors.password?.message}>
                            <input {...register("password")} type="password" placeholder="Min 6 characters" className={inputClass(errors.password)} />
                        </Field>
                        <Field label="Phone">
                            <input {...register("phone")} placeholder="+91 9876543210" className={inputClass(false)} />
                        </Field>
                        <Field label="Role" error={errors.role?.message}>
                            <select {...register("role")} className={inputClass(errors.role)}>
                                <option value="">Select role</option>
                                {ROLES.map((r) => (
                                    <option key={r} value={r} className="capitalize">{r.replace(/_/g, " ")}</option>
                                ))}
                            </select>
                        </Field>
                    </div>

                    {/* Doctor extra fields */}
                    {selectedRole === "doctor" && (
                        <div className="border-t border-slate-100 pt-4 space-y-3">
                            <p className="text-xs font-semibold text-violet-600 uppercase tracking-wider">
                                Doctor Profile
                            </p>
                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                <Field label="Specialization">
                                    <input {...register("specialization")} placeholder="Cardiologist" className={inputClass(false)} />
                                </Field>
                                <Field label="Department">
                                    <select {...register("department")} className={inputClass(false)}>
                                        <option value="">Select department</option>
                                        {DEPARTMENTS.map((d) => (
                                            <option key={d} value={d}>{d}</option>
                                        ))}
                                    </select>
                                </Field>
                                <Field label="Consultation Fee (₹)">
                                    <input {...register("consultationFee")} type="number" placeholder="500" className={inputClass(false)} />
                                </Field>
                            </div>
                        </div>
                    )}

                    {/* Patient extra fields */}
                    {selectedRole === "patient" && (
                        <div className="border-t border-slate-100 pt-4 space-y-3">
                            <p className="text-xs font-semibold text-sky-600 uppercase tracking-wider">
                                Patient Profile
                            </p>
                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                <Field label="Age">
                                    <input {...register("age")} type="number" placeholder="25" className={inputClass(false)} />
                                </Field>
                                <Field label="Gender">
                                    <select {...register("gender")} className={inputClass(false)}>
                                        <option value="">Select gender</option>
                                        <option value="male">Male</option>
                                        <option value="female">Female</option>
                                        <option value="other">Other</option>
                                    </select>
                                </Field>
                                <Field label="Blood Group">
                                    <select {...register("bloodGroup")} className={inputClass(false)}>
                                        <option value="">Select blood group</option>
                                        {BLOOD_GROUPS.map((b) => (
                                            <option key={b} value={b}>{b}</option>
                                        ))}
                                    </select>
                                </Field>
                            </div>
                        </div>
                    )}

                    <div className="flex items-center gap-3 justify-end pt-2">
                        <Button variant="outline" type="button" onClick={() => { setAddModal(false); reset(); }}>Cancel</Button>
                        <Button type="submit" variant="primary" loading={submitting}>Create User</Button>
                    </div>
                </form>
            </Modal>

            {/* Delete Modal */}
            <Modal
                isOpen={deleteModal.open}
                onClose={() => setDeleteModal({ open: false, id: null, name: "" })}
                title="Delete User"
                size="sm"
            >
                <div className="space-y-4">
                    <p className="text-sm text-slate-600">
                        Are you sure you want to permanently delete{" "}
                        <span className="font-semibold text-slate-800">{deleteModal.name}</span>?
                        This also deletes their Doctor/Patient profile.
                    </p>
                    <div className="flex gap-3 justify-end">
                        <Button variant="outline" onClick={() => setDeleteModal({ open: false, id: null, name: "" })}>Cancel</Button>
                        <Button variant="danger" loading={deleting} onClick={handleDelete}>Delete User</Button>
                    </div>
                </div>
            </Modal>

        </div>
    );
};

export default UserList;