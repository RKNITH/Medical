// import { useState } from "react";
// import { useSelector } from "react-redux";
// import { useNavigate } from "react-router-dom";
// import { useForm } from "react-hook-form";
// import { zodResolver } from "@hookform/resolvers/zod";
// import { z } from "zod";
// import api from "../../api/axios.js";
// import useFetch from "../../hooks/useFetch.js";
// import {
//     Plus, FlaskConical, Search,
//     Filter, X, Eye,
// } from "lucide-react";
// import Button from "../../components/common/Button.jsx";
// import Table from "../../components/common/Table.jsx";
// import Badge from "../../components/common/Badge.jsx";
// import Modal from "../../components/common/Modal.jsx";
// import Loader from "../../components/common/Loader.jsx";
// import { LAB_STATUS_COLOR } from "../../utils/constants.js";
// import { formatDate } from "../../utils/formatDate.js";

// const schema = z.object({
//     patient: z.string().min(1, "Patient is required."),
//     testName: z.string().min(2, "Test name is required."),
//     testCode: z.string().optional(),
//     price: z.coerce.number().min(1, "Price is required."),
//     notes: z.string().optional(),
// });

// const inputClass = (hasError) =>
//     `w-full px-3 py-2.5 rounded-lg border text-sm text-slate-800 outline-none transition-all
//    focus:ring-2 focus:ring-sky-500 focus:border-sky-500 bg-slate-50
//    ${hasError ? "border-red-400 bg-red-50" : "border-slate-200"}`;

// const Field = ({ label, error, children }) => (
//     <div>
//         <label className="block text-sm font-medium text-slate-700 mb-1.5">{label}</label>
//         {children}
//         {error && <p className="text-xs text-red-500 mt-1">{error}</p>}
//     </div>
// );

// const LabOrders = () => {
//     const { user } = useSelector((state) => state.auth);
//     const navigate = useNavigate();

//     const isDoctor = user?.role === "doctor";
//     const isLabTech = user?.role === "lab_technician";
//     const isAdmin = ["super_admin", "admin"].includes(user?.role);
//     const isPatient = user?.role === "patient";

//     const [status, setStatus] = useState("");
//     const [page, setPage] = useState(1);
//     const [createModal, setCreateModal] = useState(false);
//     const [statusModal, setStatusModal] = useState({ open: false, id: null, current: "" });
//     const [submitting, setSubmitting] = useState(false);
//     const [updatingStatus, setUpdatingStatus] = useState(false);
//     const [submitError, setSubmitError] = useState(null);
//     const limit = 10;

//     // Patient — fetch own lab tests
//     const { data: patientProfile } = useFetch(
//         isPatient ? "/patients" : null,
//         isPatient ? { limit: 100 } : {}
//     );
//     const myPatient = patientProfile?.patients?.find((p) => p.user?._id === user?._id);

//     const { data: patientLabTests, loading: patientLabLoading } = useFetch(
//         isPatient && myPatient?._id ? `/lab/patient/${myPatient._id}` : null
//     );

//     // Admin / Lab tech — fetch all
//     const { data, loading, refetch } = useFetch(
//         !isPatient ? "/lab" : null,
//         !isPatient ? { status, page, limit } : {}
//     );

//     // For create form
//     const { data: patientsData } = useFetch(
//         isDoctor || isAdmin ? "/patients" : null,
//         { limit: 100 }
//     );

//     const { register, handleSubmit, reset, formState: { errors } } = useForm({
//         resolver: zodResolver(schema),
//     });

//     const onSubmit = async (formData) => {
//         setSubmitting(true);
//         setSubmitError(null);
//         try {
//             await api.post("/lab", { ...formData, doctor: user._id });
//             reset();
//             setCreateModal(false);
//             refetch();
//         } catch (err) {
//             setSubmitError(err.response?.data?.message || "Failed to create lab test.");
//         } finally {
//             setSubmitting(false);
//         }
//     };

//     const handleStatusUpdate = async (newStatus) => {
//         setUpdatingStatus(true);
//         try {
//             await api.put(`/lab/${statusModal.id}/status`, { status: newStatus });
//             refetch();
//             setStatusModal({ open: false, id: null, current: "" });
//         } catch (err) {
//             console.error(err);
//         } finally {
//             setUpdatingStatus(false);
//         }
//     };

//     const LAB_STATUSES = ["pending", "sample_collected", "in_progress", "completed"];

//     const columns = [
//         {
//             key: "testName",
//             label: "Test",
//             render: (row) => (
//                 <div className="flex items-center gap-2.5">
//                     <div className="w-8 h-8 rounded-lg bg-rose-50 flex items-center justify-center shrink-0">
//                         <FlaskConical size={15} className="text-rose-500" />
//                     </div>
//                     <div>
//                         <p className="text-sm font-medium text-slate-800">{row.testName}</p>
//                         {row.testCode && (
//                             <p className="text-xs font-mono text-slate-400">{row.testCode}</p>
//                         )}
//                     </div>
//                 </div>
//             ),
//         },
//         {
//             key: "patient",
//             label: "Patient",
//             render: (row) => (
//                 <div>
//                     <p className="text-sm font-medium text-slate-700">{row.patient?.user?.name}</p>
//                     <p className="text-xs text-slate-400">{row.patient?.patientId}</p>
//                 </div>
//             ),
//         },
//         {
//             key: "doctor",
//             label: "Ordered By",
//             render: (row) => (
//                 <span className="text-sm text-slate-600">Dr. {row.doctor?.user?.name}</span>
//             ),
//         },
//         {
//             key: "price",
//             label: "Price",
//             render: (row) => (
//                 <span className="text-sm font-semibold text-slate-700">₹{row.price}</span>
//             ),
//         },
//         {
//             key: "status",
//             label: "Status",
//             render: (row) => (
//                 <Badge label={row.status} className={LAB_STATUS_COLOR[row.status]} />
//             ),
//         },
//         {
//             key: "createdAt",
//             label: "Ordered On",
//             render: (row) => (
//                 <span className="text-sm text-slate-500">{formatDate(row.createdAt)}</span>
//             ),
//         },
//         {
//             key: "actions",
//             label: "Actions",
//             render: (row) => (
//                 <div className="flex items-center gap-2">
//                     <Button
//                         variant="outline"
//                         size="sm"
//                         icon={Eye}
//                         onClick={() => navigate(`/lab/${row._id}`)}
//                     >
//                         View
//                     </Button>
//                     {(isLabTech || isAdmin) && row.status !== "completed" && (
//                         <Button
//                             variant="secondary"
//                             size="sm"
//                             onClick={() => setStatusModal({ open: true, id: row._id, current: row.status })}
//                         >
//                             Update
//                         </Button>
//                     )}
//                 </div>
//             ),
//         },
//     ];

//     const totalPages = Math.ceil((data?.total || 0) / limit);

//     return (
//         <div className="space-y-5">

//             {/* Header */}
//             <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
//                 <div>
//                     <h1 className="text-2xl font-bold text-slate-800">Laboratory</h1>
//                     <p className="text-sm text-slate-500 mt-0.5">
//                         {isPatient ? "Your lab test orders" : `${data?.total || 0} total lab orders`}
//                     </p>
//                 </div>
//                 {(isDoctor || isAdmin) && (
//                     <Button variant="primary" icon={Plus} onClick={() => setCreateModal(true)}>
//                         New Lab Order
//                     </Button>
//                 )}
//             </div>

//             {/* Patient View */}
//             {isPatient && (
//                 <>
//                     {patientLabLoading ? (
//                         <div className="h-40 flex items-center justify-center"><Loader size="lg" /></div>
//                     ) : !patientLabTests || patientLabTests.length === 0 ? (
//                         <div className="bg-white rounded-2xl border border-slate-100 shadow-sm p-12 flex flex-col items-center gap-3">
//                             <div className="w-14 h-14 rounded-2xl bg-slate-50 flex items-center justify-center">
//                                 <FlaskConical size={28} className="text-slate-300" />
//                             </div>
//                             <p className="text-slate-500 text-sm">No lab tests ordered yet.</p>
//                         </div>
//                     ) : (
//                         <div className="space-y-3">
//                             {patientLabTests.map((test) => (
//                                 <div
//                                     key={test._id}
//                                     className="bg-white rounded-2xl border border-slate-100 shadow-sm p-4 flex items-center justify-between"
//                                 >
//                                     <div className="flex items-center gap-3">
//                                         <div className="w-10 h-10 rounded-xl bg-rose-50 flex items-center justify-center shrink-0">
//                                             <FlaskConical size={18} className="text-rose-500" />
//                                         </div>
//                                         <div>
//                                             <p className="text-sm font-semibold text-slate-800">{test.testName}</p>
//                                             <p className="text-xs text-slate-400">
//                                                 Dr. {test.doctor?.user?.name} — {formatDate(test.createdAt)}
//                                             </p>
//                                         </div>
//                                     </div>
//                                     <div className="flex items-center gap-3">
//                                         <div className="text-right">
//                                             <Badge label={test.status} className={LAB_STATUS_COLOR[test.status]} />
//                                             <p className="text-xs text-slate-500 mt-1">₹{test.price}</p>
//                                         </div>
//                                         <Button
//                                             variant="outline"
//                                             size="sm"
//                                             icon={Eye}
//                                             onClick={() => navigate(`/lab/${test._id}`)}
//                                         >
//                                             View
//                                         </Button>
//                                     </div>
//                                 </div>
//                             ))}
//                         </div>
//                     )}
//                 </>
//             )}

//             {/* Admin / Doctor / Lab Tech View */}
//             {!isPatient && (
//                 <>
//                     {/* Filters */}
//                     <div className="bg-white rounded-2xl border border-slate-100 shadow-sm p-4">
//                         <div className="flex flex-wrap gap-3 items-center">
//                             <div className="flex items-center gap-2 text-slate-500">
//                                 <Filter size={15} />
//                                 <span className="text-sm font-medium">Filter:</span>
//                             </div>
//                             <select
//                                 value={status}
//                                 onChange={(e) => { setStatus(e.target.value); setPage(1); }}
//                                 className="px-3 py-2 rounded-lg border border-slate-200 text-sm text-slate-700 outline-none focus:ring-2 focus:ring-sky-500 bg-slate-50"
//                             >
//                                 <option value="">All Status</option>
//                                 <option value="pending">Pending</option>
//                                 <option value="sample_collected">Sample Collected</option>
//                                 <option value="in_progress">In Progress</option>
//                                 <option value="completed">Completed</option>
//                             </select>
//                             {status && (
//                                 <Button variant="ghost" size="sm" icon={X} onClick={() => { setStatus(""); setPage(1); }}>
//                                     Clear
//                                 </Button>
//                             )}
//                         </div>
//                     </div>

//                     {/* Table */}
//                     <Table
//                         columns={columns}
//                         data={data?.tests || []}
//                         loading={loading}
//                         emptyMessage="No lab orders found."
//                     />

//                     {/* Pagination */}
//                     {totalPages > 1 && (
//                         <div className="flex items-center justify-between px-1">
//                             <p className="text-sm text-slate-500">Page {page} of {totalPages}</p>
//                             <div className="flex gap-2">
//                                 <Button variant="outline" size="sm" disabled={page === 1} onClick={() => setPage(page - 1)}>Previous</Button>
//                                 <Button variant="outline" size="sm" disabled={page === totalPages} onClick={() => setPage(page + 1)}>Next</Button>
//                             </div>
//                         </div>
//                     )}
//                 </>
//             )}

//             {/* Create Lab Order Modal */}
//             <Modal
//                 isOpen={createModal}
//                 onClose={() => { setCreateModal(false); reset(); setSubmitError(null); }}
//                 title="New Lab Order"
//                 size="md"
//             >
//                 <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
//                     {submitError && (
//                         <div className="px-4 py-3 bg-red-50 border border-red-200 rounded-lg text-red-600 text-sm">
//                             {submitError}
//                         </div>
//                     )}

//                     <Field label="Patient" error={errors.patient?.message}>
//                         <select {...register("patient")} className={inputClass(errors.patient)}>
//                             <option value="">Select patient</option>
//                             {patientsData?.patients?.map((p) => (
//                                 <option key={p._id} value={p._id}>
//                                     {p.user?.name} — {p.patientId}
//                                 </option>
//                             ))}
//                         </select>
//                     </Field>

//                     <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
//                         <Field label="Test Name" error={errors.testName?.message}>
//                             <input
//                                 {...register("testName")}
//                                 placeholder="e.g. Complete Blood Count"
//                                 className={inputClass(errors.testName)}
//                             />
//                         </Field>
//                         <Field label="Test Code (optional)">
//                             <input
//                                 {...register("testCode")}
//                                 placeholder="e.g. CBC-001"
//                                 className={inputClass(false)}
//                             />
//                         </Field>
//                         <Field label="Price (₹)" error={errors.price?.message}>
//                             <input
//                                 {...register("price")}
//                                 type="number"
//                                 placeholder="500"
//                                 className={inputClass(errors.price)}
//                             />
//                         </Field>
//                         <Field label="Notes (optional)">
//                             <input
//                                 {...register("notes")}
//                                 placeholder="Special instructions..."
//                                 className={inputClass(false)}
//                             />
//                         </Field>
//                     </div>

//                     <div className="flex items-center gap-3 justify-end pt-2">
//                         <Button variant="outline" type="button" onClick={() => { setCreateModal(false); reset(); }}>
//                             Cancel
//                         </Button>
//                         <Button type="submit" variant="primary" loading={submitting}>
//                             Create Order
//                         </Button>
//                     </div>
//                 </form>
//             </Modal>

//             {/* Status Update Modal */}
//             <Modal
//                 isOpen={statusModal.open}
//                 onClose={() => setStatusModal({ open: false, id: null, current: "" })}
//                 title="Update Lab Test Status"
//                 size="sm"
//             >
//                 <div className="space-y-2">
//                     <p className="text-sm text-slate-500 mb-4">Select the new status for this lab test.</p>
//                     {LAB_STATUSES.map((s) => (
//                         <button
//                             key={s}
//                             disabled={s === statusModal.current || updatingStatus}
//                             onClick={() => handleStatusUpdate(s)}
//                             className={`w-full flex items-center justify-between px-4 py-3 rounded-xl border text-sm font-medium transition-all capitalize
//                 ${s === statusModal.current
//                                     ? "border-sky-200 bg-sky-50 text-sky-700 cursor-default"
//                                     : "border-slate-200 hover:border-sky-300 hover:bg-sky-50 text-slate-700 cursor-pointer"
//                                 }`}
//                         >
//                             <span>{s.replace(/_/g, " ")}</span>
//                             {s === statusModal.current && (
//                                 <span className="text-xs text-sky-500 font-normal">Current</span>
//                             )}
//                         </button>
//                     ))}
//                 </div>
//             </Modal>

//         </div>
//     );
// };

// export default LabOrders;








import { useState } from "react";
import { useSelector } from "react-redux";
import { useNavigate } from "react-router-dom";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import api from "../../api/axios.js";
import useFetch from "../../hooks/useFetch.js";
import {
    Plus, FlaskConical, Filter, X, Eye,
} from "lucide-react";
import Button from "../../components/common/Button.jsx";
import Table from "../../components/common/Table.jsx";
import Badge from "../../components/common/Badge.jsx";
import Modal from "../../components/common/Modal.jsx";
import Loader from "../../components/common/Loader.jsx";
import { LAB_STATUS_COLOR } from "../../utils/constants.js";
import { formatDate } from "../../utils/formatDate.js";

const schema = z.object({
    patient: z.string().min(1, "Patient is required."),
    testName: z.string().min(2, "Test name is required."),
    testCode: z.string().optional(),
    price: z.coerce.number().min(1, "Price is required."),
    notes: z.string().optional(),
});

const inputCls = (err) =>
    `w-full px-3 py-2.5 rounded-lg border text-sm text-slate-800 outline-none transition-all
     focus:ring-2 focus:ring-sky-500 focus:border-sky-500 bg-slate-50
     ${err ? "border-red-400 bg-red-50" : "border-slate-200"}`;

const Field = ({ label, error, children }) => (
    <div>
        <label className="block text-sm font-medium text-slate-700 mb-1.5">{label}</label>
        {children}
        {error && <p className="text-xs text-red-500 mt-1">{error}</p>}
    </div>
);

const LAB_STATUSES = ["pending", "sample_collected", "in_progress", "completed"];

const LabOrders = () => {
    const { user } = useSelector((state) => state.auth);
    const navigate = useNavigate();

    const isDoctor = user?.role === "doctor";
    const isLabTech = user?.role === "lab_technician";
    const isAdmin = ["super_admin", "admin"].includes(user?.role);
    const isPatient = user?.role === "patient";

    const [status, setStatus] = useState("");
    const [page, setPage] = useState(1);
    const [createModal, setCreateModal] = useState(false);
    const [statusModal, setStatusModal] = useState({ open: false, id: null, current: "" });
    const [submitting, setSubmitting] = useState(false);
    const [updatingStatus, setUpdatingStatus] = useState(false);
    const [submitError, setSubmitError] = useState(null);
    const limit = 10;

    // ── Resolve own profiles via /me endpoints ─────────────────
    const { data: myPatientProfile, loading: patientProfileLoading } = useFetch(
        isPatient ? "/patients/me" : null
    );
    const { data: myDoctorProfile } = useFetch(
        isDoctor ? "/doctors/me" : null
    );

    // ── Patient: fetch own lab tests ───────────────────────────
    const { data: patientLabTests, loading: patientLabLoading } = useFetch(
        isPatient && myPatientProfile?._id ? `/lab/patient/${myPatientProfile._id}` : null
    );

    // ── Doctor: fetch own lab tests filtered by doctor ID ─────
    const { data: doctorLabData, loading: doctorLabLoading, refetch: refetchDoctor } = useFetch(
        isDoctor && myDoctorProfile?._id ? "/lab" : null,
        isDoctor && myDoctorProfile?._id
            ? { doctor: myDoctorProfile._id, status, page, limit }
            : {}
    );

    // ── Admin / Lab Tech: fetch all ────────────────────────────
    const { data: adminLabData, loading: adminLabLoading, refetch: refetchAdmin } = useFetch(
        isAdmin || isLabTech ? "/lab" : null,
        isAdmin || isLabTech ? { status, page, limit } : {}
    );

    // unified data and refetch for non-patient
    const data = isDoctor ? doctorLabData : adminLabData;
    const loading = isDoctor ? doctorLabLoading : adminLabLoading;
    const refetch = isDoctor ? refetchDoctor : refetchAdmin;

    // ── Patients list for create form ──────────────────────────
    const { data: patientsData } = useFetch(
        isDoctor || isAdmin ? "/patients" : null,
        { limit: 200 }
    );

    const { register, handleSubmit, reset, formState: { errors } } = useForm({
        resolver: zodResolver(schema),
    });

    const onSubmit = async (formData) => {
        setSubmitting(true);
        setSubmitError(null);
        try {
            // doctor ID is resolved server-side from req.user._id
            // admin must pass doctor explicitly — for now use logged-in user context
            await api.post("/lab", {
                patient: formData.patient,
                testName: formData.testName,
                testCode: formData.testCode,
                price: formData.price,
                notes: formData.notes,
                // backend resolves doctor from req.user._id automatically
            });
            reset();
            setCreateModal(false);
            refetch();
        } catch (err) {
            setSubmitError(err.response?.data?.message || "Failed to create lab order.");
        } finally {
            setSubmitting(false);
        }
    };

    const handleStatusUpdate = async (newStatus) => {
        setUpdatingStatus(true);
        try {
            await api.put(`/lab/${statusModal.id}/status`, { status: newStatus });
            refetch();
            setStatusModal({ open: false, id: null, current: "" });
        } catch (err) {
            console.error(err);
        } finally {
            setUpdatingStatus(false);
        }
    };

    const totalPages = Math.ceil((data?.total || 0) / limit);

    const columns = [
        {
            key: "testName",
            label: "Test",
            render: (row) => (
                <div className="flex items-center gap-2.5">
                    <div className="w-8 h-8 rounded-lg bg-rose-50 flex items-center justify-center shrink-0">
                        <FlaskConical size={15} className="text-rose-500" />
                    </div>
                    <div>
                        <p className="text-sm font-medium text-slate-800">{row.testName}</p>
                        {row.testCode && (
                            <p className="text-xs font-mono text-slate-400">{row.testCode}</p>
                        )}
                    </div>
                </div>
            ),
        },
        {
            key: "patient",
            label: "Patient",
            render: (row) => (
                <div>
                    <p className="text-sm font-medium text-slate-700">{row.patient?.user?.name}</p>
                    <p className="text-xs text-slate-400">{row.patient?.patientId}</p>
                </div>
            ),
        },
        {
            key: "doctor",
            label: "Ordered By",
            render: (row) => (
                <span className="text-sm text-slate-600">
                    Dr. {row.doctor?.user?.name || "—"}
                </span>
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
            key: "status",
            label: "Status",
            render: (row) => (
                <Badge label={row.status} className={LAB_STATUS_COLOR[row.status]} />
            ),
        },
        {
            key: "createdAt",
            label: "Ordered On",
            render: (row) => (
                <span className="text-sm text-slate-500">{formatDate(row.createdAt)}</span>
            ),
        },
        {
            key: "actions",
            label: "Actions",
            render: (row) => (
                <div className="flex items-center gap-2">
                    <Button
                        variant="outline"
                        size="sm"
                        icon={Eye}
                        onClick={() => navigate(`/lab/${row._id}`)}
                    >
                        View
                    </Button>
                    {(isLabTech || isAdmin) && row.status !== "completed" && (
                        <Button
                            variant="secondary"
                            size="sm"
                            onClick={() => setStatusModal({ open: true, id: row._id, current: row.status })}
                        >
                            Update
                        </Button>
                    )}
                </div>
            ),
        },
    ];

    // ── Patient loading ────────────────────────────────────────
    if (isPatient && patientProfileLoading) {
        return <div className="h-64 flex items-center justify-center"><Loader size="lg" /></div>;
    }

    return (
        <div className="space-y-5">

            {/* Header */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                <div>
                    <h1 className="text-2xl font-bold text-slate-800">Laboratory</h1>
                    <p className="text-sm text-slate-500 mt-0.5">
                        {isPatient
                            ? `${patientLabTests?.length || 0} lab test${patientLabTests?.length !== 1 ? "s" : ""}`
                            : `${data?.total || 0} total lab orders`
                        }
                    </p>
                </div>
                {(isDoctor || isAdmin) && (
                    <Button variant="primary" icon={Plus} onClick={() => setCreateModal(true)}>
                        New Lab Order
                    </Button>
                )}
            </div>

            {/* ── Patient View ─────────────────────────────── */}
            {isPatient && (
                <>
                    {patientLabLoading ? (
                        <div className="h-40 flex items-center justify-center"><Loader size="lg" /></div>
                    ) : !patientLabTests?.length ? (
                        <div className="bg-white rounded-2xl border border-slate-100 shadow-sm p-12 flex flex-col items-center gap-3">
                            <div className="w-14 h-14 rounded-2xl bg-slate-50 flex items-center justify-center">
                                <FlaskConical size={28} className="text-slate-300" />
                            </div>
                            <p className="text-slate-500 text-sm">No lab tests ordered yet.</p>
                        </div>
                    ) : (
                        <div className="space-y-3">
                            {patientLabTests.map((test) => (
                                <div
                                    key={test._id}
                                    className="bg-white rounded-2xl border border-slate-100 shadow-sm p-4 flex items-center justify-between gap-3"
                                >
                                    <div className="flex items-center gap-3 min-w-0">
                                        <div className="w-10 h-10 rounded-xl bg-rose-50 flex items-center justify-center shrink-0">
                                            <FlaskConical size={18} className="text-rose-500" />
                                        </div>
                                        <div className="min-w-0">
                                            <p className="text-sm font-semibold text-slate-800 truncate">
                                                {test.testName}
                                            </p>
                                            <p className="text-xs text-slate-400">
                                                Dr. {test.doctor?.user?.name} — {formatDate(test.createdAt)}
                                            </p>
                                        </div>
                                    </div>
                                    <div className="flex items-center gap-3 shrink-0">
                                        <div className="text-right hidden sm:block">
                                            <Badge label={test.status} className={LAB_STATUS_COLOR[test.status]} />
                                            <p className="text-xs text-slate-500 mt-1">₹{test.price}</p>
                                        </div>
                                        <Button
                                            variant="outline"
                                            size="sm"
                                            icon={Eye}
                                            onClick={() => navigate(`/lab/${test._id}`)}
                                        >
                                            View
                                        </Button>
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}
                </>
            )}

            {/* ── Admin / Doctor / Lab Tech View ───────────── */}
            {!isPatient && (
                <>
                    {/* Filters */}
                    <div className="bg-white rounded-2xl border border-slate-100 shadow-sm p-4">
                        <div className="flex flex-wrap gap-3 items-center">
                            <div className="flex items-center gap-2 text-slate-500">
                                <Filter size={15} />
                                <span className="text-sm font-medium">Filter:</span>
                            </div>
                            <select
                                value={status}
                                onChange={(e) => { setStatus(e.target.value); setPage(1); }}
                                className="px-3 py-2 rounded-lg border border-slate-200 text-sm text-slate-700 outline-none focus:ring-2 focus:ring-sky-500 bg-slate-50"
                            >
                                <option value="">All Status</option>
                                <option value="pending">Pending</option>
                                <option value="sample_collected">Sample Collected</option>
                                <option value="in_progress">In Progress</option>
                                <option value="completed">Completed</option>
                            </select>
                            {status && (
                                <Button variant="ghost" size="sm" icon={X} onClick={() => { setStatus(""); setPage(1); }}>
                                    Clear
                                </Button>
                            )}
                        </div>
                    </div>

                    <Table
                        columns={columns}
                        data={data?.tests || []}
                        loading={loading}
                        emptyMessage="No lab orders found."
                    />

                    {totalPages > 1 && (
                        <div className="flex items-center justify-between px-1">
                            <p className="text-sm text-slate-500">Page {page} of {totalPages}</p>
                            <div className="flex gap-2">
                                <Button variant="outline" size="sm" disabled={page === 1} onClick={() => setPage(page - 1)}>
                                    Previous
                                </Button>
                                <Button variant="outline" size="sm" disabled={page === totalPages} onClick={() => setPage(page + 1)}>
                                    Next
                                </Button>
                            </div>
                        </div>
                    )}
                </>
            )}

            {/* Create Lab Order Modal */}
            <Modal
                isOpen={createModal}
                onClose={() => { setCreateModal(false); reset(); setSubmitError(null); }}
                title="New Lab Order"
                size="md"
            >
                <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
                    {submitError && (
                        <div className="px-4 py-3 bg-red-50 border border-red-200 rounded-lg text-red-600 text-sm">
                            {submitError}
                        </div>
                    )}

                    <Field label="Patient" error={errors.patient?.message}>
                        <select {...register("patient")} className={inputCls(errors.patient)}>
                            <option value="">Select patient</option>
                            {patientsData?.patients?.map((p) => (
                                <option key={p._id} value={p._id}>
                                    {p.user?.name} — {p.patientId}
                                </option>
                            ))}
                        </select>
                    </Field>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                        <Field label="Test Name" error={errors.testName?.message}>
                            <input
                                {...register("testName")}
                                placeholder="e.g. Complete Blood Count"
                                className={inputCls(errors.testName)}
                            />
                        </Field>
                        <Field label="Test Code (optional)">
                            <input
                                {...register("testCode")}
                                placeholder="e.g. CBC-001"
                                className={inputCls(false)}
                            />
                        </Field>
                        <Field label="Price (₹)" error={errors.price?.message}>
                            <input
                                {...register("price")}
                                type="number"
                                placeholder="500"
                                className={inputCls(errors.price)}
                            />
                        </Field>
                        <Field label="Notes (optional)">
                            <input
                                {...register("notes")}
                                placeholder="Special instructions..."
                                className={inputCls(false)}
                            />
                        </Field>
                    </div>

                    <div className="flex items-center gap-3 justify-end pt-2">
                        <Button variant="outline" type="button" onClick={() => { setCreateModal(false); reset(); }}>
                            Cancel
                        </Button>
                        <Button type="submit" variant="primary" loading={submitting}>
                            Create Order
                        </Button>
                    </div>
                </form>
            </Modal>

            {/* Status Update Modal */}
            <Modal
                isOpen={statusModal.open}
                onClose={() => setStatusModal({ open: false, id: null, current: "" })}
                title="Update Lab Test Status"
                size="sm"
            >
                <div className="space-y-2">
                    <p className="text-sm text-slate-500 mb-4">Select the new status for this lab test.</p>
                    {LAB_STATUSES.map((s) => (
                        <button
                            key={s}
                            disabled={s === statusModal.current || updatingStatus}
                            onClick={() => handleStatusUpdate(s)}
                            className={`w-full flex items-center justify-between px-4 py-3 rounded-xl border text-sm font-medium transition-all capitalize
                                ${s === statusModal.current
                                    ? "border-sky-200 bg-sky-50 text-sky-700 cursor-default"
                                    : "border-slate-200 hover:border-sky-300 hover:bg-sky-50 text-slate-700 cursor-pointer"
                                }`}
                        >
                            <span>{s.replace(/_/g, " ")}</span>
                            {s === statusModal.current && (
                                <span className="text-xs text-sky-500 font-normal">Current</span>
                            )}
                        </button>
                    ))}
                </div>
            </Modal>

        </div>
    );
};

export default LabOrders;