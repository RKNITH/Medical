// import { useEffect, useState } from "react";
// import { useDispatch, useSelector } from "react-redux";
// import { useNavigate } from "react-router-dom";
// import { fetchAppointments } from "../../store/slices/appointmentSlice.js";
// import api from "../../api/axios.js";
// import { Plus, Search, Filter, X } from "lucide-react";
// import Button from "../../components/common/Button.jsx";
// import Table from "../../components/common/Table.jsx";
// import Badge from "../../components/common/Badge.jsx";
// import Modal from "../../components/common/Modal.jsx";
// import { APPOINTMENT_STATUS_COLOR } from "../../utils/constants.js";
// import { formatDate, smartDate } from "../../utils/formatDate.js";

// const AppointmentList = () => {
//     const dispatch = useDispatch();
//     const navigate = useNavigate();
//     const { list, total, loading } = useSelector((state) => state.appointments);
//     const { user } = useSelector((state) => state.auth);

//     const [status, setStatus] = useState("");
//     const [type, setType] = useState("");
//     const [date, setDate] = useState("");
//     const [page, setPage] = useState(1);
//     const [cancelModal, setCancelModal] = useState({ open: false, id: null });
//     const [cancelReason, setCancelReason] = useState("");
//     const [cancelling, setCancelling] = useState(false);
//     const [statusModal, setStatusModal] = useState({ open: false, id: null, current: "" });
//     const [updatingStatus, setUpdatingStatus] = useState(false);

//     const limit = 10;
//     const canAdd = ["super_admin", "admin", "receptionist", "patient"].includes(user?.role);
//     const canManage = ["super_admin", "admin", "doctor", "nurse", "receptionist"].includes(user?.role);

//     useEffect(() => {
//         dispatch(fetchAppointments({ status, type, date, page, limit }));
//     }, [status, type, date, page]);

//     const handleCancel = async () => {
//         if (!cancelReason.trim()) return;
//         setCancelling(true);
//         try {
//             await api.put(`/appointments/${cancelModal.id}/cancel`, { cancelReason });
//             dispatch(fetchAppointments({ status, type, date, page, limit }));
//             setCancelModal({ open: false, id: null });
//             setCancelReason("");
//         } catch (err) {
//             console.error(err);
//         } finally {
//             setCancelling(false);
//         }
//     };

//     const handleStatusUpdate = async (newStatus) => {
//         setUpdatingStatus(true);
//         try {
//             await api.put(`/appointments/${statusModal.id}/status`, { status: newStatus });
//             dispatch(fetchAppointments({ status, type, date, page, limit }));
//             setStatusModal({ open: false, id: null, current: "" });
//         } catch (err) {
//             console.error(err);
//         } finally {
//             setUpdatingStatus(false);
//         }
//     };

//     const clearFilters = () => {
//         setStatus("");
//         setType("");
//         setDate("");
//         setPage(1);
//     };

//     const hasFilters = status || type || date;

//     const columns = [
//         {
//             key: "patient",
//             label: "Patient",
//             render: (row) => (
//                 <div className="flex items-center gap-2.5">
//                     <div className="w-8 h-8 rounded-full bg-sky-100 flex items-center justify-center text-sky-600 font-semibold text-sm shrink-0">
//                         {row.patient?.user?.name?.charAt(0)}
//                     </div>
//                     <div>
//                         <p className="text-sm font-medium text-slate-800">{row.patient?.user?.name}</p>
//                         <p className="text-xs text-slate-400">{row.patient?.user?.phone || "—"}</p>
//                     </div>
//                 </div>
//             ),
//         },
//         {
//             key: "doctor",
//             label: "Doctor",
//             render: (row) => (
//                 <div>
//                     <p className="text-sm font-medium text-slate-700">Dr. {row.doctor?.user?.name}</p>
//                     <p className="text-xs text-slate-400">{row.doctor?.specialization}</p>
//                 </div>
//             ),
//         },
//         {
//             key: "appointmentDate",
//             label: "Date & Time",
//             render: (row) => (
//                 <div>
//                     <p className="text-sm text-slate-700">{formatDate(row.appointmentDate)}</p>
//                     <p className="text-xs text-slate-400">{row.timeSlot}</p>
//                 </div>
//             ),
//         },
//         {
//             key: "type",
//             label: "Type",
//             render: (row) => (
//                 <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium uppercase
//           ${row.type === "emergency" ? "bg-red-100 text-red-700" :
//                         row.type === "ipd" ? "bg-purple-100 text-purple-700" :
//                             "bg-sky-100 text-sky-700"}`}>
//                     {row.type}
//                 </span>
//             ),
//         },
//         {
//             key: "status",
//             label: "Status",
//             render: (row) => (
//                 <Badge label={row.status} className={APPOINTMENT_STATUS_COLOR[row.status]} />
//             ),
//         },
//         {
//             key: "actions",
//             label: "Actions",
//             render: (row) => (
//                 <div className="flex items-center gap-2">
//                     {canManage && row.status !== "completed" && row.status !== "cancelled" && (
//                         <Button
//                             variant="outline"
//                             size="sm"
//                             onClick={() => setStatusModal({ open: true, id: row._id, current: row.status })}
//                         >
//                             Update
//                         </Button>
//                     )}
//                     {row.status !== "cancelled" && row.status !== "completed" && (
//                         <Button
//                             variant="danger"
//                             size="sm"
//                             icon={X}
//                             onClick={() => setCancelModal({ open: true, id: row._id })}
//                         >
//                             Cancel
//                         </Button>
//                     )}
//                 </div>
//             ),
//         },
//     ];

//     const totalPages = Math.ceil(total / limit);

//     return (
//         <div className="space-y-5">

//             {/* Header */}
//             <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
//                 <div>
//                     <h1 className="text-2xl font-bold text-slate-800">Appointments</h1>
//                     <p className="text-sm text-slate-500 mt-0.5">{total} total appointments</p>
//                 </div>
//                 {canAdd && (
//                     <Button variant="primary" icon={Plus} onClick={() => navigate("/appointments/book")}>
//                         Book Appointment
//                     </Button>
//                 )}
//             </div>

//             {/* Filters */}
//             <div className="bg-white rounded-2xl border border-slate-100 shadow-sm p-4">
//                 <div className="flex flex-wrap gap-3 items-center">
//                     <div className="flex items-center gap-2 text-slate-500">
//                         <Filter size={15} />
//                         <span className="text-sm font-medium">Filters:</span>
//                     </div>
//                     <select
//                         value={status}
//                         onChange={(e) => { setStatus(e.target.value); setPage(1); }}
//                         className="px-3 py-2 rounded-lg border border-slate-200 text-sm text-slate-700 outline-none focus:ring-2 focus:ring-sky-500 bg-slate-50"
//                     >
//                         <option value="">All Status</option>
//                         <option value="scheduled">Scheduled</option>
//                         <option value="in_progress">In Progress</option>
//                         <option value="completed">Completed</option>
//                         <option value="cancelled">Cancelled</option>
//                     </select>
//                     <select
//                         value={type}
//                         onChange={(e) => { setType(e.target.value); setPage(1); }}
//                         className="px-3 py-2 rounded-lg border border-slate-200 text-sm text-slate-700 outline-none focus:ring-2 focus:ring-sky-500 bg-slate-50"
//                     >
//                         <option value="">All Types</option>
//                         <option value="opd">OPD</option>
//                         <option value="ipd">IPD</option>
//                         <option value="emergency">Emergency</option>
//                     </select>
//                     <input
//                         type="date"
//                         value={date}
//                         onChange={(e) => { setDate(e.target.value); setPage(1); }}
//                         className="px-3 py-2 rounded-lg border border-slate-200 text-sm text-slate-700 outline-none focus:ring-2 focus:ring-sky-500 bg-slate-50"
//                     />
//                     {hasFilters && (
//                         <Button variant="ghost" size="sm" icon={X} onClick={clearFilters}>
//                             Clear
//                         </Button>
//                     )}
//                 </div>
//             </div>

//             {/* Table */}
//             <Table
//                 columns={columns}
//                 data={list}
//                 loading={loading}
//                 emptyMessage="No appointments found."
//             />

//             {/* Pagination */}
//             {totalPages > 1 && (
//                 <div className="flex items-center justify-between px-1">
//                     <p className="text-sm text-slate-500">Page {page} of {totalPages}</p>
//                     <div className="flex gap-2">
//                         <Button variant="outline" size="sm" disabled={page === 1} onClick={() => setPage(page - 1)}>Previous</Button>
//                         <Button variant="outline" size="sm" disabled={page === totalPages} onClick={() => setPage(page + 1)}>Next</Button>
//                     </div>
//                 </div>
//             )}

//             {/* Cancel Modal */}
//             <Modal
//                 isOpen={cancelModal.open}
//                 onClose={() => { setCancelModal({ open: false, id: null }); setCancelReason(""); }}
//                 title="Cancel Appointment"
//                 size="sm"
//             >
//                 <div className="space-y-4">
//                     <p className="text-sm text-slate-600">Please provide a reason for cancellation.</p>
//                     <textarea
//                         value={cancelReason}
//                         onChange={(e) => setCancelReason(e.target.value)}
//                         placeholder="Reason for cancellation..."
//                         rows={3}
//                         className="w-full px-3 py-2.5 rounded-lg border border-slate-200 text-sm text-slate-800 outline-none focus:ring-2 focus:ring-sky-500 resize-none bg-slate-50"
//                     />
//                     <div className="flex gap-3 justify-end">
//                         <Button variant="outline" onClick={() => setCancelModal({ open: false, id: null })}>Back</Button>
//                         <Button
//                             variant="danger"
//                             loading={cancelling}
//                             disabled={!cancelReason.trim()}
//                             onClick={handleCancel}
//                         >
//                             Confirm Cancel
//                         </Button>
//                     </div>
//                 </div>
//             </Modal>

//             {/* Status Update Modal */}
//             <Modal
//                 isOpen={statusModal.open}
//                 onClose={() => setStatusModal({ open: false, id: null, current: "" })}
//                 title="Update Appointment Status"
//                 size="sm"
//             >
//                 <div className="space-y-3">
//                     <p className="text-sm text-slate-600 mb-4">Select the new status for this appointment.</p>
//                     {["scheduled", "in_progress", "completed"].map((s) => (
//                         <button
//                             key={s}
//                             disabled={s === statusModal.current || updatingStatus}
//                             onClick={() => handleStatusUpdate(s)}
//                             className={`w-full flex items-center justify-between px-4 py-3 rounded-xl border text-sm font-medium transition-all
//                 ${s === statusModal.current
//                                     ? "border-sky-200 bg-sky-50 text-sky-700 cursor-default"
//                                     : "border-slate-200 hover:border-sky-300 hover:bg-sky-50 text-slate-700 cursor-pointer"
//                                 }`}
//                         >
//                             <span className="capitalize">{s.replace(/_/g, " ")}</span>
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

// export default AppointmentList;




//  new one
import { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { useNavigate } from "react-router-dom";
import { fetchAppointments } from "../../store/slices/appointmentSlice.js";
import api from "../../api/axios.js";
import { Plus, Filter, X } from "lucide-react";
import Button from "../../components/common/Button.jsx";
import Table from "../../components/common/Table.jsx";
import Badge from "../../components/common/Badge.jsx";
import Modal from "../../components/common/Modal.jsx";
import { APPOINTMENT_STATUS_COLOR } from "../../utils/constants.js";
import { formatDate, smartDate } from "../../utils/formatDate.js";
import useFetch from "../../hooks/useFetch.js";

const AppointmentList = () => {
    const dispatch = useDispatch();
    const navigate = useNavigate();
    const { list, total, loading } = useSelector((state) => state.appointments);
    const { user } = useSelector((state) => state.auth);

    const [status, setStatus] = useState("");
    const [type, setType] = useState("");
    const [date, setDate] = useState("");
    const [page, setPage] = useState(1);
    const [cancelModal, setCancelModal] = useState({ open: false, id: null });
    const [cancelReason, setCancelReason] = useState("");
    const [cancelling, setCancelling] = useState(false);
    const [statusModal, setStatusModal] = useState({ open: false, id: null, current: "" });
    const [updatingStatus, setUpdatingStatus] = useState(false);

    const limit = 10;
    const profileId = user?.profileId;

    const isAdmin = ["super_admin", "admin"].includes(user?.role);
    const isDoctor = user?.role === "doctor";
    const isPatient = user?.role === "patient";
    // Other staff (nurse, receptionist, etc.) see all appointments
    const isStaff = ["nurse", "receptionist", "lab_technician", "pharmacist"].includes(user?.role);

    const canAdd = ["super_admin", "admin", "receptionist", "patient"].includes(user?.role);
    const canManage = ["super_admin", "admin", "doctor", "nurse", "receptionist"].includes(user?.role);

    // ✅ Patient: fetch only their own appointments via dedicated endpoint (no pagination needed)
    const { data: patientAppts, loading: patientLoading } = useFetch(
        isPatient && profileId ? `/appointments/patient/${profileId}` : null
    );

    // ✅ Doctor: fetch only their own appointments via dedicated endpoint (no pagination needed)
    const { data: doctorAppts, loading: doctorLoading } = useFetch(
        isDoctor && profileId ? `/appointments/doctor/${profileId}` : null
    );

    // ✅ Admin / Staff: use Redux + paginated /appointments endpoint
    useEffect(() => {
        if (isAdmin || isStaff) {
            dispatch(fetchAppointments({ status, type, date, page, limit }));
        }
    }, [status, type, date, page, isAdmin, isStaff]);

    // Resolve the correct data + loading state based on role
    const appointments = isPatient ? patientAppts :
        isDoctor ? doctorAppts :
            list; // admin/staff use Redux list

    const appointmentsLoading = isPatient ? patientLoading :
        isDoctor ? doctorLoading :
            loading;

    // Client-side filter for patient/doctor (their endpoints don't support query params)
    const filteredAppointments = (isPatient || isDoctor)
        ? (appointments || []).filter((a) => {
            if (status && a.status !== status) return false;
            if (type && a.type !== type) return false;
            if (date) {
                const apptDate = new Date(a.appointmentDate).toISOString().split("T")[0];
                if (apptDate !== date) return false;
            }
            return true;
        })
        : appointments;

    const handleCancel = async () => {
        if (!cancelReason.trim()) return;
        setCancelling(true);
        try {
            await api.put(`/appointments/${cancelModal.id}/cancel`, { cancelReason });
            // Refetch based on role
            if (isAdmin || isStaff) {
                dispatch(fetchAppointments({ status, type, date, page, limit }));
            }
            setCancelModal({ open: false, id: null });
            setCancelReason("");
            // For patient/doctor, useFetch will auto-refetch on next render
            window.location.reload(); // simple refresh for patient/doctor after cancel
        } catch (err) {
            console.error(err);
        } finally {
            setCancelling(false);
        }
    };

    const handleStatusUpdate = async (newStatus) => {
        setUpdatingStatus(true);
        try {
            await api.put(`/appointments/${statusModal.id}/status`, { status: newStatus });
            if (isAdmin || isStaff) {
                dispatch(fetchAppointments({ status, type, date, page, limit }));
            }
            setStatusModal({ open: false, id: null, current: "" });
            window.location.reload();
        } catch (err) {
            console.error(err);
        } finally {
            setUpdatingStatus(false);
        }
    };

    const clearFilters = () => {
        setStatus(""); setType(""); setDate(""); setPage(1);
    };

    const hasFilters = status || type || date;
    const totalPages = Math.ceil(total / limit);
    const displayTotal = (isPatient || isDoctor) ? filteredAppointments?.length : total;

    const columns = [
        {
            key: "patient",
            label: "Patient",
            render: (row) => (
                <div className="flex items-center gap-2.5">
                    <div className="w-8 h-8 rounded-full bg-sky-100 flex items-center justify-center text-sky-600 font-semibold text-sm shrink-0">
                        {row.patient?.user?.name?.charAt(0)}
                    </div>
                    <div>
                        <p className="text-sm font-medium text-slate-800">{row.patient?.user?.name}</p>
                        <p className="text-xs text-slate-400">{row.patient?.user?.phone || "—"}</p>
                    </div>
                </div>
            ),
        },
        {
            key: "doctor",
            label: "Doctor",
            render: (row) => (
                <div>
                    <p className="text-sm font-medium text-slate-700">Dr. {row.doctor?.user?.name}</p>
                    <p className="text-xs text-slate-400">{row.doctor?.specialization}</p>
                </div>
            ),
        },
        {
            key: "appointmentDate",
            label: "Date & Time",
            render: (row) => (
                <div>
                    <p className="text-sm text-slate-700">{formatDate(row.appointmentDate)}</p>
                    <p className="text-xs text-slate-400">{row.timeSlot}</p>
                </div>
            ),
        },
        {
            key: "type",
            label: "Type",
            render: (row) => (
                <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium uppercase
                    ${row.type === "emergency" ? "bg-red-100 text-red-700" :
                        row.type === "ipd" ? "bg-purple-100 text-purple-700" :
                            "bg-sky-100 text-sky-700"}`}>
                    {row.type}
                </span>
            ),
        },
        {
            key: "status",
            label: "Status",
            render: (row) => (
                <Badge label={row.status} className={APPOINTMENT_STATUS_COLOR[row.status]} />
            ),
        },
        {
            key: "actions",
            label: "Actions",
            render: (row) => (
                <div className="flex items-center gap-2">
                    {canManage && row.status !== "completed" && row.status !== "cancelled" && (
                        <Button
                            variant="outline" size="sm"
                            onClick={() => setStatusModal({ open: true, id: row._id, current: row.status })}
                        >
                            Update
                        </Button>
                    )}
                    {row.status !== "cancelled" && row.status !== "completed" && (
                        <Button
                            variant="danger" size="sm" icon={X}
                            onClick={() => setCancelModal({ open: true, id: row._id })}
                        >
                            Cancel
                        </Button>
                    )}
                </div>
            ),
        },
    ];

    return (
        <div className="space-y-5">

            {/* Header */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                <div>
                    <h1 className="text-2xl font-bold text-slate-800">Appointments</h1>
                    <p className="text-sm text-slate-500 mt-0.5">{displayTotal ?? 0} total appointments</p>
                </div>
                {canAdd && (
                    <Button variant="primary" icon={Plus} onClick={() => navigate("/appointments/book")}>
                        Book Appointment
                    </Button>
                )}
            </div>

            {/* Filters */}
            <div className="bg-white rounded-2xl border border-slate-100 shadow-sm p-4">
                <div className="flex flex-wrap gap-3 items-center">
                    <div className="flex items-center gap-2 text-slate-500">
                        <Filter size={15} />
                        <span className="text-sm font-medium">Filters:</span>
                    </div>
                    <select value={status} onChange={(e) => { setStatus(e.target.value); setPage(1); }}
                        className="px-3 py-2 rounded-lg border border-slate-200 text-sm text-slate-700 outline-none focus:ring-2 focus:ring-sky-500 bg-slate-50">
                        <option value="">All Status</option>
                        <option value="scheduled">Scheduled</option>
                        <option value="in_progress">In Progress</option>
                        <option value="completed">Completed</option>
                        <option value="cancelled">Cancelled</option>
                    </select>
                    <select value={type} onChange={(e) => { setType(e.target.value); setPage(1); }}
                        className="px-3 py-2 rounded-lg border border-slate-200 text-sm text-slate-700 outline-none focus:ring-2 focus:ring-sky-500 bg-slate-50">
                        <option value="">All Types</option>
                        <option value="opd">OPD</option>
                        <option value="ipd">IPD</option>
                        <option value="emergency">Emergency</option>
                    </select>
                    <input type="date" value={date} onChange={(e) => { setDate(e.target.value); setPage(1); }}
                        className="px-3 py-2 rounded-lg border border-slate-200 text-sm text-slate-700 outline-none focus:ring-2 focus:ring-sky-500 bg-slate-50"
                    />
                    {hasFilters && (
                        <Button variant="ghost" size="sm" icon={X} onClick={clearFilters}>Clear</Button>
                    )}
                </div>
            </div>

            {/* Table */}
            <Table
                columns={columns}
                data={filteredAppointments || []}
                loading={appointmentsLoading}
                emptyMessage="No appointments found."
            />

            {/* Pagination — admin/staff only */}
            {(isAdmin || isStaff) && totalPages > 1 && (
                <div className="flex items-center justify-between px-1">
                    <p className="text-sm text-slate-500">Page {page} of {totalPages}</p>
                    <div className="flex gap-2">
                        <Button variant="outline" size="sm" disabled={page === 1} onClick={() => setPage(page - 1)}>Previous</Button>
                        <Button variant="outline" size="sm" disabled={page === totalPages} onClick={() => setPage(page + 1)}>Next</Button>
                    </div>
                </div>
            )}

            {/* Cancel Modal */}
            <Modal
                isOpen={cancelModal.open}
                onClose={() => { setCancelModal({ open: false, id: null }); setCancelReason(""); }}
                title="Cancel Appointment" size="sm"
            >
                <div className="space-y-4">
                    <p className="text-sm text-slate-600">Please provide a reason for cancellation.</p>
                    <textarea
                        value={cancelReason}
                        onChange={(e) => setCancelReason(e.target.value)}
                        placeholder="Reason for cancellation..."
                        rows={3}
                        className="w-full px-3 py-2.5 rounded-lg border border-slate-200 text-sm text-slate-800 outline-none focus:ring-2 focus:ring-sky-500 resize-none bg-slate-50"
                    />
                    <div className="flex gap-3 justify-end">
                        <Button variant="outline" onClick={() => setCancelModal({ open: false, id: null })}>Back</Button>
                        <Button variant="danger" loading={cancelling} disabled={!cancelReason.trim()} onClick={handleCancel}>
                            Confirm Cancel
                        </Button>
                    </div>
                </div>
            </Modal>

            {/* Status Update Modal */}
            <Modal
                isOpen={statusModal.open}
                onClose={() => setStatusModal({ open: false, id: null, current: "" })}
                title="Update Appointment Status" size="sm"
            >
                <div className="space-y-3">
                    <p className="text-sm text-slate-600 mb-4">Select the new status for this appointment.</p>
                    {["scheduled", "in_progress", "completed"].map((s) => (
                        <button
                            key={s}
                            disabled={s === statusModal.current || updatingStatus}
                            onClick={() => handleStatusUpdate(s)}
                            className={`w-full flex items-center justify-between px-4 py-3 rounded-xl border text-sm font-medium transition-all
                                ${s === statusModal.current
                                    ? "border-sky-200 bg-sky-50 text-sky-700 cursor-default"
                                    : "border-slate-200 hover:border-sky-300 hover:bg-sky-50 text-slate-700 cursor-pointer"
                                }`}
                        >
                            <span className="capitalize">{s.replace(/_/g, " ")}</span>
                            {s === statusModal.current && <span className="text-xs text-sky-500 font-normal">Current</span>}
                        </button>
                    ))}
                </div>
            </Modal>

        </div>
    );
};

export default AppointmentList;