// import { useState } from "react";
// import { useSelector } from "react-redux";
// import { useNavigate } from "react-router-dom";
// import useFetch from "../../hooks/useFetch.js";
// import api from "../../api/axios.js";
// import {
//     Plus, Receipt, Filter, X,
//     Download, Eye,
// } from "lucide-react";
// import Button from "../../components/common/Button.jsx";
// import Table from "../../components/common/Table.jsx";
// import Badge from "../../components/common/Badge.jsx";
// import Modal from "../../components/common/Modal.jsx";
// import { PAYMENT_STATUS_COLOR } from "../../utils/constants.js";
// import { formatDate } from "../../utils/formatDate.js";

// const BillingList = () => {
//     const navigate = useNavigate();
//     const { user } = useSelector((state) => state.auth);

//     const isPatient = user?.role === "patient";
//     const canCreate = ["super_admin", "admin", "receptionist"].includes(user?.role);

//     const [paymentStatus, setPaymentStatus] = useState("");
//     const [paymentMode, setPaymentMode] = useState("");
//     const [page, setPage] = useState(1);
//     const limit = 10;

//     const [detailModal, setDetailModal] = useState({ open: false, bill: null });
//     const [payModal, setPayModal] = useState({ open: false, id: null });
//     const [payMode, setPayMode] = useState("cash");
//     const [payStatus, setPayStatus] = useState("paid");
//     const [updating, setUpdating] = useState(false);

//     // Patient — fetch own bills
//     const { data: patientProfile } = useFetch(
//         isPatient ? "/patients" : null,
//         isPatient ? { limit: 100 } : {}
//     );
//     const myPatient = patientProfile?.patients?.find((p) => p.user?._id === user?._id);

//     const { data: patientBills, loading: patientBillLoading, refetch: refetchPatient } = useFetch(
//         isPatient && myPatient?._id ? `/billing/patient/${myPatient._id}` : null
//     );

//     // Admin / Receptionist — fetch all
//     const { data, loading, refetch } = useFetch(
//         !isPatient ? "/billing" : null,
//         !isPatient ? { paymentStatus, paymentMode, page, limit } : {}
//     );

//     const handlePaymentUpdate = async () => {
//         setUpdating(true);
//         try {
//             await api.put(`/billing/${payModal.id}/payment`, {
//                 paymentStatus: payStatus,
//                 paymentMode: payMode,
//             });
//             refetch();
//             setPayModal({ open: false, id: null });
//         } catch (err) {
//             console.error(err);
//         } finally {
//             setUpdating(false);
//         }
//     };

//     const handleDownload = (id) => {
//         window.open(`${import.meta.env.VITE_API_URL}/billing/${id}/pdf`, "_blank");
//     };

//     const clearFilters = () => {
//         setPaymentStatus("");
//         setPaymentMode("");
//         setPage(1);
//     };

//     const totalPages = Math.ceil((data?.total || 0) / limit);

//     const columns = [
//         {
//             key: "billNo",
//             label: "Bill No",
//             render: (row) => (
//                 <span className="font-mono text-xs bg-slate-100 px-2 py-1 rounded text-slate-600">
//                     {row.billNo}
//                 </span>
//             ),
//         },
//         {
//             key: "patient",
//             label: "Patient",
//             render: (row) => (
//                 <div>
//                     <p className="text-sm font-medium text-slate-800">{row.patient?.user?.name}</p>
//                     <p className="text-xs text-slate-400">{row.patient?.patientId}</p>
//                 </div>
//             ),
//         },
//         {
//             key: "items",
//             label: "Items",
//             render: (row) => (
//                 <span className="text-sm text-slate-600">{row.items?.length} item{row.items?.length !== 1 ? "s" : ""}</span>
//             ),
//         },
//         {
//             key: "finalAmount",
//             label: "Amount",
//             render: (row) => (
//                 <div>
//                     <p className="text-sm font-bold text-slate-800">₹{row.finalAmount}</p>
//                     {row.discount > 0 && (
//                         <p className="text-xs text-emerald-600">-₹{row.discount} off</p>
//                     )}
//                 </div>
//             ),
//         },
//         {
//             key: "paymentMode",
//             label: "Mode",
//             render: (row) => (
//                 <span className="text-sm text-slate-600 capitalize">{row.paymentMode}</span>
//             ),
//         },
//         {
//             key: "paymentStatus",
//             label: "Status",
//             render: (row) => (
//                 <Badge label={row.paymentStatus} className={PAYMENT_STATUS_COLOR[row.paymentStatus]} />
//             ),
//         },
//         {
//             key: "createdAt",
//             label: "Date",
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
//                         variant="ghost"
//                         size="sm"
//                         onClick={() => setDetailModal({ open: true, bill: row })}
//                     >
//                         <Eye size={15} />
//                     </Button>
//                     <Button
//                         variant="ghost"
//                         size="sm"
//                         onClick={() => handleDownload(row._id)}
//                     >
//                         <Download size={15} />
//                     </Button>
//                     {canCreate && row.paymentStatus !== "paid" && (
//                         <Button
//                             variant="outline"
//                             size="sm"
//                             onClick={() => { setPayModal({ open: true, id: row._id }); setPayMode(row.paymentMode); }}
//                         >
//                             Pay
//                         </Button>
//                     )}
//                 </div>
//             ),
//         },
//     ];

//     // Patient bills table columns (simpler)
//     const patientColumns = [
//         {
//             key: "billNo",
//             label: "Bill No",
//             render: (row) => (
//                 <span className="font-mono text-xs bg-slate-100 px-2 py-1 rounded text-slate-600">
//                     {row.billNo}
//                 </span>
//             ),
//         },
//         {
//             key: "items",
//             label: "Items",
//             render: (row) => (
//                 <span className="text-sm text-slate-600">{row.items?.length} item{row.items?.length !== 1 ? "s" : ""}</span>
//             ),
//         },
//         {
//             key: "finalAmount",
//             label: "Amount",
//             render: (row) => (
//                 <span className="text-sm font-bold text-slate-800">₹{row.finalAmount}</span>
//             ),
//         },
//         {
//             key: "paymentStatus",
//             label: "Status",
//             render: (row) => (
//                 <Badge label={row.paymentStatus} className={PAYMENT_STATUS_COLOR[row.paymentStatus]} />
//             ),
//         },
//         {
//             key: "createdAt",
//             label: "Date",
//             render: (row) => (
//                 <span className="text-sm text-slate-500">{formatDate(row.createdAt)}</span>
//             ),
//         },
//         {
//             key: "actions",
//             label: "Actions",
//             render: (row) => (
//                 <div className="flex items-center gap-2">
//                     <Button variant="ghost" size="sm" onClick={() => setDetailModal({ open: true, bill: row })}>
//                         <Eye size={15} />
//                     </Button>
//                     <Button variant="ghost" size="sm" onClick={() => handleDownload(row._id)}>
//                         <Download size={15} />
//                     </Button>
//                 </div>
//             ),
//         },
//     ];

//     return (
//         <div className="space-y-5">

//             {/* Header */}
//             <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
//                 <div>
//                     <h1 className="text-2xl font-bold text-slate-800">Billing</h1>
//                     <p className="text-sm text-slate-500 mt-0.5">
//                         {isPatient ? "Your bills and invoices" : `${data?.total || 0} total bills`}
//                     </p>
//                 </div>
//                 {canCreate && (
//                     <Button variant="primary" icon={Plus} onClick={() => navigate("/billing/generate")}>
//                         Generate Bill
//                     </Button>
//                 )}
//             </div>

//             {/* Summary Cards — admin only */}
//             {!isPatient && data && (
//                 <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
//                     {[
//                         {
//                             label: "Total Bills",
//                             value: data.total,
//                             color: "bg-sky-50 text-sky-700",
//                             icon: Receipt,
//                         },
//                         {
//                             label: "Paid",
//                             value: data.bills?.filter((b) => b.paymentStatus === "paid").length,
//                             color: "bg-emerald-50 text-emerald-700",
//                             icon: Receipt,
//                         },
//                         {
//                             label: "Unpaid",
//                             value: data.bills?.filter((b) => b.paymentStatus === "unpaid").length,
//                             color: "bg-red-50 text-red-700",
//                             icon: Receipt,
//                         },
//                     ].map((card) => (
//                         <div key={card.label} className={`flex items-center gap-4 p-4 rounded-2xl border border-slate-100 bg-white shadow-sm`}>
//                             <div className={`w-10 h-10 rounded-xl flex items-center justify-center shrink-0 ${card.color}`}>
//                                 <card.icon size={18} />
//                             </div>
//                             <div>
//                                 <p className="text-xs text-slate-500">{card.label}</p>
//                                 <p className="text-2xl font-bold text-slate-800">{card.value ?? 0}</p>
//                             </div>
//                         </div>
//                     ))}
//                 </div>
//             )}

//             {/* Filters — admin only */}
//             {!isPatient && (
//                 <div className="bg-white rounded-2xl border border-slate-100 shadow-sm p-4">
//                     <div className="flex flex-wrap gap-3 items-center">
//                         <div className="flex items-center gap-2 text-slate-500">
//                             <Filter size={15} />
//                             <span className="text-sm font-medium">Filter:</span>
//                         </div>
//                         <select
//                             value={paymentStatus}
//                             onChange={(e) => { setPaymentStatus(e.target.value); setPage(1); }}
//                             className="px-3 py-2 rounded-lg border border-slate-200 text-sm text-slate-700 outline-none focus:ring-2 focus:ring-sky-500 bg-slate-50"
//                         >
//                             <option value="">All Status</option>
//                             <option value="paid">Paid</option>
//                             <option value="unpaid">Unpaid</option>
//                             <option value="partial">Partial</option>
//                         </select>
//                         <select
//                             value={paymentMode}
//                             onChange={(e) => { setPaymentMode(e.target.value); setPage(1); }}
//                             className="px-3 py-2 rounded-lg border border-slate-200 text-sm text-slate-700 outline-none focus:ring-2 focus:ring-sky-500 bg-slate-50"
//                         >
//                             <option value="">All Modes</option>
//                             <option value="cash">Cash</option>
//                             <option value="card">Card</option>
//                             <option value="insurance">Insurance</option>
//                             <option value="online">Online</option>
//                         </select>
//                         {(paymentStatus || paymentMode) && (
//                             <Button variant="ghost" size="sm" icon={X} onClick={clearFilters}>Clear</Button>
//                         )}
//                     </div>
//                 </div>
//             )}

//             {/* Table */}
//             {isPatient ? (
//                 <Table
//                     columns={patientColumns}
//                     data={patientBills || []}
//                     loading={patientBillLoading}
//                     emptyMessage="No bills found."
//                 />
//             ) : (
//                 <Table
//                     columns={columns}
//                     data={data?.bills || []}
//                     loading={loading}
//                     emptyMessage="No bills found."
//                 />
//             )}

//             {/* Pagination */}
//             {!isPatient && totalPages > 1 && (
//                 <div className="flex items-center justify-between px-1">
//                     <p className="text-sm text-slate-500">Page {page} of {totalPages}</p>
//                     <div className="flex gap-2">
//                         <Button variant="outline" size="sm" disabled={page === 1} onClick={() => setPage(page - 1)}>Previous</Button>
//                         <Button variant="outline" size="sm" disabled={page === totalPages} onClick={() => setPage(page + 1)}>Next</Button>
//                     </div>
//                 </div>
//             )}

//             {/* Bill Detail Modal */}
//             <Modal
//                 isOpen={detailModal.open}
//                 onClose={() => setDetailModal({ open: false, bill: null })}
//                 title={`Bill — ${detailModal.bill?.billNo}`}
//                 size="md"
//             >
//                 {detailModal.bill && (
//                     <div className="space-y-4">
//                         <div className="grid grid-cols-2 gap-3">
//                             <div className="p-3 bg-slate-50 rounded-xl">
//                                 <p className="text-xs text-slate-400">Patient</p>
//                                 <p className="text-sm font-medium text-slate-700">{detailModal.bill.patient?.user?.name}</p>
//                             </div>
//                             <div className="p-3 bg-slate-50 rounded-xl">
//                                 <p className="text-xs text-slate-400">Date</p>
//                                 <p className="text-sm font-medium text-slate-700">{formatDate(detailModal.bill.createdAt)}</p>
//                             </div>
//                             <div className="p-3 bg-slate-50 rounded-xl">
//                                 <p className="text-xs text-slate-400">Payment Mode</p>
//                                 <p className="text-sm font-medium text-slate-700 capitalize">{detailModal.bill.paymentMode}</p>
//                             </div>
//                             <div className="p-3 bg-slate-50 rounded-xl">
//                                 <p className="text-xs text-slate-400">Status</p>
//                                 <Badge
//                                     label={detailModal.bill.paymentStatus}
//                                     className={PAYMENT_STATUS_COLOR[detailModal.bill.paymentStatus]}
//                                 />
//                             </div>
//                         </div>

//                         {/* Items */}
//                         <div>
//                             <p className="text-sm font-semibold text-slate-700 mb-2">Charge Breakdown</p>
//                             <div className="space-y-2">
//                                 {detailModal.bill.items?.map((item, i) => (
//                                     <div key={i} className="flex items-center justify-between py-2 border-b border-slate-50 last:border-0">
//                                         <div>
//                                             <p className="text-sm text-slate-700">{item.description}</p>
//                                             <span className="text-xs px-2 py-0.5 bg-slate-100 rounded-full text-slate-500 capitalize">
//                                                 {item.type}
//                                             </span>
//                                         </div>
//                                         <p className="text-sm font-semibold text-slate-800">₹{item.amount}</p>
//                                     </div>
//                                 ))}
//                             </div>
//                         </div>

//                         {/* Totals */}
//                         <div className="space-y-2 pt-2 border-t border-slate-100">
//                             <div className="flex justify-between text-sm text-slate-600">
//                                 <span>Subtotal</span>
//                                 <span>₹{detailModal.bill.totalAmount}</span>
//                             </div>
//                             {detailModal.bill.discount > 0 && (
//                                 <div className="flex justify-between text-sm text-emerald-600">
//                                     <span>Discount</span>
//                                     <span>-₹{detailModal.bill.discount}</span>
//                                 </div>
//                             )}
//                             <div className="flex justify-between text-base font-bold text-slate-800 pt-1 border-t border-slate-100">
//                                 <span>Total</span>
//                                 <span>₹{detailModal.bill.finalAmount}</span>
//                             </div>
//                         </div>

//                         <div className="flex gap-3 justify-end pt-2">
//                             <Button
//                                 variant="outline"
//                                 icon={Download}
//                                 onClick={() => handleDownload(detailModal.bill._id)}
//                             >
//                                 Download PDF
//                             </Button>
//                         </div>
//                     </div>
//                 )}
//             </Modal>

//             {/* Payment Update Modal */}
//             <Modal
//                 isOpen={payModal.open}
//                 onClose={() => setPayModal({ open: false, id: null })}
//                 title="Update Payment"
//                 size="sm"
//             >
//                 <div className="space-y-4">
//                     <div>
//                         <label className="block text-sm font-medium text-slate-700 mb-2">Payment Status</label>
//                         <div className="flex gap-2">
//                             {["paid", "partial", "unpaid"].map((s) => (
//                                 <button
//                                     key={s}
//                                     onClick={() => setPayStatus(s)}
//                                     className={`flex-1 py-2 rounded-xl border text-sm font-medium capitalize transition-colors
//                     ${payStatus === s
//                                             ? "bg-sky-500 text-white border-sky-500"
//                                             : "border-slate-200 text-slate-600 hover:bg-slate-50"}`}
//                                 >
//                                     {s}
//                                 </button>
//                             ))}
//                         </div>
//                     </div>
//                     <div>
//                         <label className="block text-sm font-medium text-slate-700 mb-2">Payment Mode</label>
//                         <div className="flex flex-wrap gap-2">
//                             {["cash", "card", "insurance", "online"].map((m) => (
//                                 <button
//                                     key={m}
//                                     onClick={() => setPayMode(m)}
//                                     className={`px-3 py-2 rounded-xl border text-sm font-medium capitalize transition-colors
//                     ${payMode === m
//                                             ? "bg-sky-500 text-white border-sky-500"
//                                             : "border-slate-200 text-slate-600 hover:bg-slate-50"}`}
//                                 >
//                                     {m}
//                                 </button>
//                             ))}
//                         </div>
//                     </div>
//                     <div className="flex gap-3 justify-end pt-2">
//                         <Button variant="outline" onClick={() => setPayModal({ open: false, id: null })}>Cancel</Button>
//                         <Button variant="primary" loading={updating} onClick={handlePaymentUpdate}>
//                             Update Payment
//                         </Button>
//                     </div>
//                 </div>
//             </Modal>

//         </div>
//     );
// };

// export default BillingList;



import { useState } from "react";
import { useSelector } from "react-redux";
import { useNavigate } from "react-router-dom";
import useFetch from "../../hooks/useFetch.js";
import api from "../../api/axios.js";
import {
    Plus, Receipt, Filter, X,
    Download, Eye,
} from "lucide-react";
import Button from "../../components/common/Button.jsx";
import Table from "../../components/common/Table.jsx";
import Badge from "../../components/common/Badge.jsx";
import Modal from "../../components/common/Modal.jsx";
import Loader from "../../components/common/Loader.jsx";
import { PAYMENT_STATUS_COLOR } from "../../utils/constants.js";
import { formatDate } from "../../utils/formatDate.js";

const BillingList = () => {
    const navigate = useNavigate();
    const { user } = useSelector((state) => state.auth);

    const isPatient = user?.role === "patient";
    const canCreate = ["super_admin", "admin", "receptionist"].includes(user?.role);
    const canUpdatePayment = ["super_admin", "admin", "receptionist"].includes(user?.role);

    const [paymentStatus, setPaymentStatus] = useState("");
    const [paymentMode, setPaymentMode] = useState("");
    const [page, setPage] = useState(1);
    const limit = 10;

    const [detailModal, setDetailModal] = useState({ open: false, bill: null });
    const [payModal, setPayModal] = useState({ open: false, id: null });
    const [payMode, setPayMode] = useState("cash");
    const [payStatus, setPayStatus] = useState("paid");
    const [updating, setUpdating] = useState(false);

    // ── Patient: resolve profile via /me, then fetch own bills ──
    const { data: myProfile, loading: profileLoading } = useFetch(
        isPatient ? "/patients/me" : null
    );

    const { data: patientBills, loading: patientBillLoading, refetch: refetchPatient } = useFetch(
        isPatient && myProfile?._id ? `/billing/patient/${myProfile._id}` : null
    );

    // ── Admin / Receptionist / Doctor: fetch all bills ───────────
    const { data, loading, refetch } = useFetch(
        !isPatient ? "/billing" : null,
        !isPatient ? { paymentStatus, paymentMode, page, limit } : {}
    );

    const handlePaymentUpdate = async () => {
        setUpdating(true);
        try {
            await api.put(`/billing/${payModal.id}/payment`, {
                paymentStatus: payStatus,
                paymentMode: payMode,
            });
            refetch();
            setPayModal({ open: false, id: null });
        } catch (err) {
            console.error(err);
        } finally {
            setUpdating(false);
        }
    };

    const handleDownload = (id) => {
        window.open(`${import.meta.env.VITE_API_URL}/billing/${id}/pdf`, "_blank");
    };

    const clearFilters = () => {
        setPaymentStatus("");
        setPaymentMode("");
        setPage(1);
    };

    const totalPages = Math.ceil((data?.total || 0) / limit);

    // ── Bill detail modal open helper ────────────────────────────
    const openDetail = (bill) => setDetailModal({ open: true, bill });

    // ── Columns for admin/staff view ─────────────────────────────
    const columns = [
        {
            key: "billNo",
            label: "Bill No",
            render: (row) => (
                <span className="font-mono text-xs bg-slate-100 px-2 py-1 rounded text-slate-600">
                    {row.billNo}
                </span>
            ),
        },
        {
            key: "patient",
            label: "Patient",
            render: (row) => (
                <div>
                    <p className="text-sm font-medium text-slate-800">{row.patient?.user?.name}</p>
                    <p className="text-xs text-slate-400">{row.patient?.patientId}</p>
                </div>
            ),
        },
        {
            key: "items",
            label: "Items",
            render: (row) => (
                <span className="text-sm text-slate-600">
                    {row.items?.length} item{row.items?.length !== 1 ? "s" : ""}
                </span>
            ),
        },
        {
            key: "finalAmount",
            label: "Amount",
            render: (row) => (
                <div>
                    <p className="text-sm font-bold text-slate-800">₹{row.finalAmount}</p>
                    {row.discount > 0 && (
                        <p className="text-xs text-emerald-600">-₹{row.discount} off</p>
                    )}
                </div>
            ),
        },
        {
            key: "paymentMode",
            label: "Mode",
            render: (row) => (
                <span className="text-sm text-slate-600 capitalize">{row.paymentMode || "—"}</span>
            ),
        },
        {
            key: "paymentStatus",
            label: "Status",
            render: (row) => (
                <Badge label={row.paymentStatus} className={PAYMENT_STATUS_COLOR[row.paymentStatus]} />
            ),
        },
        {
            key: "createdAt",
            label: "Date",
            render: (row) => (
                <span className="text-sm text-slate-500">{formatDate(row.createdAt)}</span>
            ),
        },
        {
            key: "actions",
            label: "Actions",
            render: (row) => (
                <div className="flex items-center gap-2">
                    <Button variant="ghost" size="sm" onClick={() => openDetail(row)}>
                        <Eye size={15} />
                    </Button>
                    <Button variant="ghost" size="sm" onClick={() => handleDownload(row._id)}>
                        <Download size={15} />
                    </Button>
                    {canUpdatePayment && row.paymentStatus !== "paid" && (
                        <Button
                            variant="outline"
                            size="sm"
                            onClick={() => {
                                setPayModal({ open: true, id: row._id });
                                setPayMode(row.paymentMode || "cash");
                                setPayStatus("paid");
                            }}
                        >
                            Pay
                        </Button>
                    )}
                </div>
            ),
        },
    ];

    // ── Columns for patient view (simpler, no patient column) ────
    const patientColumns = [
        {
            key: "billNo",
            label: "Bill No",
            render: (row) => (
                <span className="font-mono text-xs bg-slate-100 px-2 py-1 rounded text-slate-600">
                    {row.billNo}
                </span>
            ),
        },
        {
            key: "items",
            label: "Items",
            render: (row) => (
                <span className="text-sm text-slate-600">
                    {row.items?.length} item{row.items?.length !== 1 ? "s" : ""}
                </span>
            ),
        },
        {
            key: "finalAmount",
            label: "Amount",
            render: (row) => (
                <div>
                    <p className="text-sm font-bold text-slate-800">₹{row.finalAmount}</p>
                    {row.discount > 0 && (
                        <p className="text-xs text-emerald-600">-₹{row.discount} off</p>
                    )}
                </div>
            ),
        },
        {
            key: "paymentStatus",
            label: "Status",
            render: (row) => (
                <Badge label={row.paymentStatus} className={PAYMENT_STATUS_COLOR[row.paymentStatus]} />
            ),
        },
        {
            key: "createdAt",
            label: "Date",
            render: (row) => (
                <span className="text-sm text-slate-500">{formatDate(row.createdAt)}</span>
            ),
        },
        {
            key: "actions",
            label: "Actions",
            render: (row) => (
                <div className="flex items-center gap-2">
                    <Button variant="ghost" size="sm" onClick={() => openDetail(row)}>
                        <Eye size={15} />
                    </Button>
                    <Button variant="ghost" size="sm" onClick={() => handleDownload(row._id)}>
                        <Download size={15} />
                    </Button>
                </div>
            ),
        },
    ];

    // ── Patient loading state ─────────────────────────────────────
    if (isPatient && profileLoading) {
        return (
            <div className="h-64 flex items-center justify-center">
                <Loader size="lg" />
            </div>
        );
    }

    // ── Unpaid summary for patient ────────────────────────────────
    const unpaidAmount = patientBills
        ?.filter((b) => b.paymentStatus === "unpaid")
        .reduce((sum, b) => sum + b.finalAmount, 0) || 0;

    return (
        <div className="space-y-5">

            {/* Header */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                <div>
                    <h1 className="text-2xl font-bold text-slate-800">Billing</h1>
                    <p className="text-sm text-slate-500 mt-0.5">
                        {isPatient
                            ? `${patientBills?.length || 0} bill${patientBills?.length !== 1 ? "s" : ""} found`
                            : `${data?.total || 0} total bills`
                        }
                    </p>
                </div>
                {canCreate && (
                    <Button variant="primary" icon={Plus} onClick={() => navigate("/billing/generate")}>
                        Generate Bill
                    </Button>
                )}
            </div>

            {/* Patient — unpaid alert */}
            {isPatient && unpaidAmount > 0 && (
                <div className="flex items-center justify-between p-4 bg-red-50 border border-red-200 rounded-xl">
                    <div>
                        <p className="text-sm font-semibold text-red-800">Outstanding Amount</p>
                        <p className="text-xs text-red-600">
                            You have ₹{unpaidAmount} in unpaid bills. Please contact reception.
                        </p>
                    </div>
                    <span className="text-xl font-bold text-red-700">₹{unpaidAmount}</span>
                </div>
            )}

            {/* Admin Summary Cards */}
            {!isPatient && data && (
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                    {[
                        { label: "Total Bills", value: data.total, colorCls: "bg-sky-50 text-sky-600" },
                        { label: "Paid", value: data.bills?.filter((b) => b.paymentStatus === "paid").length, colorCls: "bg-emerald-50 text-emerald-600" },
                        { label: "Unpaid", value: data.bills?.filter((b) => b.paymentStatus === "unpaid").length, colorCls: "bg-red-50 text-red-600" },
                    ].map((card) => (
                        <div key={card.label} className="flex items-center gap-4 p-4 rounded-2xl border border-slate-100 bg-white shadow-sm">
                            <div className={`w-10 h-10 rounded-xl flex items-center justify-center shrink-0 ${card.colorCls}`}>
                                <Receipt size={18} />
                            </div>
                            <div>
                                <p className="text-xs text-slate-500">{card.label}</p>
                                <p className="text-2xl font-bold text-slate-800">{card.value ?? 0}</p>
                            </div>
                        </div>
                    ))}
                </div>
            )}

            {/* Filters — admin/staff only */}
            {!isPatient && (
                <div className="bg-white rounded-2xl border border-slate-100 shadow-sm p-4">
                    <div className="flex flex-wrap gap-3 items-center">
                        <div className="flex items-center gap-2 text-slate-500">
                            <Filter size={15} />
                            <span className="text-sm font-medium">Filter:</span>
                        </div>
                        <select
                            value={paymentStatus}
                            onChange={(e) => { setPaymentStatus(e.target.value); setPage(1); }}
                            className="px-3 py-2 rounded-lg border border-slate-200 text-sm text-slate-700 outline-none focus:ring-2 focus:ring-sky-500 bg-slate-50"
                        >
                            <option value="">All Status</option>
                            <option value="paid">Paid</option>
                            <option value="unpaid">Unpaid</option>
                            <option value="partial">Partial</option>
                        </select>
                        <select
                            value={paymentMode}
                            onChange={(e) => { setPaymentMode(e.target.value); setPage(1); }}
                            className="px-3 py-2 rounded-lg border border-slate-200 text-sm text-slate-700 outline-none focus:ring-2 focus:ring-sky-500 bg-slate-50"
                        >
                            <option value="">All Modes</option>
                            <option value="cash">Cash</option>
                            <option value="card">Card</option>
                            <option value="insurance">Insurance</option>
                            <option value="online">Online</option>
                        </select>
                        {(paymentStatus || paymentMode) && (
                            <Button variant="ghost" size="sm" icon={X} onClick={clearFilters}>Clear</Button>
                        )}
                    </div>
                </div>
            )}

            {/* Table */}
            {isPatient ? (
                <Table
                    columns={patientColumns}
                    data={patientBills || []}
                    loading={patientBillLoading}
                    emptyMessage="No bills found."
                />
            ) : (
                <Table
                    columns={columns}
                    data={data?.bills || []}
                    loading={loading}
                    emptyMessage="No bills found."
                />
            )}

            {/* Pagination — admin/staff only */}
            {!isPatient && totalPages > 1 && (
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

            {/* Bill Detail Modal */}
            <Modal
                isOpen={detailModal.open}
                onClose={() => setDetailModal({ open: false, bill: null })}
                title={`Bill — ${detailModal.bill?.billNo}`}
                size="md"
            >
                {detailModal.bill && (
                    <div className="space-y-4">
                        <div className="grid grid-cols-2 gap-3">
                            {!isPatient && (
                                <div className="p-3 bg-slate-50 rounded-xl">
                                    <p className="text-xs text-slate-400">Patient</p>
                                    <p className="text-sm font-medium text-slate-700">
                                        {detailModal.bill.patient?.user?.name}
                                    </p>
                                </div>
                            )}
                            <div className="p-3 bg-slate-50 rounded-xl">
                                <p className="text-xs text-slate-400">Date</p>
                                <p className="text-sm font-medium text-slate-700">
                                    {formatDate(detailModal.bill.createdAt)}
                                </p>
                            </div>
                            <div className="p-3 bg-slate-50 rounded-xl">
                                <p className="text-xs text-slate-400">Payment Mode</p>
                                <p className="text-sm font-medium text-slate-700 capitalize">
                                    {detailModal.bill.paymentMode || "—"}
                                </p>
                            </div>
                            <div className="p-3 bg-slate-50 rounded-xl">
                                <p className="text-xs text-slate-400">Status</p>
                                <Badge
                                    label={detailModal.bill.paymentStatus}
                                    className={PAYMENT_STATUS_COLOR[detailModal.bill.paymentStatus]}
                                />
                            </div>
                        </div>

                        {/* Items */}
                        <div>
                            <p className="text-sm font-semibold text-slate-700 mb-2">Charge Breakdown</p>
                            <div className="space-y-2">
                                {detailModal.bill.items?.map((item, i) => (
                                    <div key={i} className="flex items-center justify-between py-2 border-b border-slate-50 last:border-0">
                                        <div>
                                            <p className="text-sm text-slate-700">{item.description}</p>
                                            <span className="text-xs px-2 py-0.5 bg-slate-100 rounded-full text-slate-500 capitalize">
                                                {item.type}
                                            </span>
                                        </div>
                                        <p className="text-sm font-semibold text-slate-800">₹{item.amount}</p>
                                    </div>
                                ))}
                            </div>
                        </div>

                        {/* Totals */}
                        <div className="space-y-2 pt-2 border-t border-slate-100">
                            <div className="flex justify-between text-sm text-slate-600">
                                <span>Subtotal</span>
                                <span>₹{detailModal.bill.totalAmount}</span>
                            </div>
                            {detailModal.bill.discount > 0 && (
                                <div className="flex justify-between text-sm text-emerald-600">
                                    <span>Discount</span>
                                    <span>-₹{detailModal.bill.discount}</span>
                                </div>
                            )}
                            <div className="flex justify-between text-base font-bold text-slate-800 pt-1 border-t border-slate-100">
                                <span>Total</span>
                                <span>₹{detailModal.bill.finalAmount}</span>
                            </div>
                        </div>

                        <div className="flex gap-3 justify-end pt-2">
                            <Button
                                variant="outline"
                                icon={Download}
                                onClick={() => handleDownload(detailModal.bill._id)}
                            >
                                Download PDF
                            </Button>
                        </div>
                    </div>
                )}
            </Modal>

            {/* Payment Update Modal */}
            <Modal
                isOpen={payModal.open}
                onClose={() => setPayModal({ open: false, id: null })}
                title="Update Payment"
                size="sm"
            >
                <div className="space-y-4">
                    <div>
                        <label className="block text-sm font-medium text-slate-700 mb-2">Payment Status</label>
                        <div className="flex gap-2">
                            {["paid", "partial", "unpaid"].map((s) => (
                                <button
                                    key={s}
                                    onClick={() => setPayStatus(s)}
                                    className={`flex-1 py-2 rounded-xl border text-sm font-medium capitalize transition-colors
                                        ${payStatus === s
                                            ? "bg-sky-500 text-white border-sky-500"
                                            : "border-slate-200 text-slate-600 hover:bg-slate-50"}`}
                                >
                                    {s}
                                </button>
                            ))}
                        </div>
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-slate-700 mb-2">Payment Mode</label>
                        <div className="flex flex-wrap gap-2">
                            {["cash", "card", "insurance", "online"].map((m) => (
                                <button
                                    key={m}
                                    onClick={() => setPayMode(m)}
                                    className={`px-3 py-2 rounded-xl border text-sm font-medium capitalize transition-colors
                                        ${payMode === m
                                            ? "bg-sky-500 text-white border-sky-500"
                                            : "border-slate-200 text-slate-600 hover:bg-slate-50"}`}
                                >
                                    {m}
                                </button>
                            ))}
                        </div>
                    </div>
                    <div className="flex gap-3 justify-end pt-2">
                        <Button variant="outline" onClick={() => setPayModal({ open: false, id: null })}>
                            Cancel
                        </Button>
                        <Button variant="primary" loading={updating} onClick={handlePaymentUpdate}>
                            Update Payment
                        </Button>
                    </div>
                </div>
            </Modal>

        </div>
    );
};

export default BillingList;