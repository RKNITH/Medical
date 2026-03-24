import { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { useNavigate } from "react-router-dom";
import { fetchPatients } from "../../store/slices/patientSlice.js";
import { UserRound, Plus, Search, Eye } from "lucide-react";
import Button from "../../components/common/Button.jsx";
import Table from "../../components/common/Table.jsx";
import Badge from "../../components/common/Badge.jsx";
import { BLOOD_GROUPS } from "../../utils/constants.js";
import { formatDate } from "../../utils/formatDate.js";

const PatientList = () => {
    const dispatch = useDispatch();
    const navigate = useNavigate();
    const { list, total, loading } = useSelector((state) => state.patients);
    const { user } = useSelector((state) => state.auth);

    const [search, setSearch] = useState("");
    const [page, setPage] = useState(1);
    const limit = 10;

    const canAdd = ["super_admin", "admin", "receptionist"].includes(user?.role);

    useEffect(() => {
        dispatch(fetchPatients({ search, page, limit }));
    }, [search, page]);

    const columns = [
        {
            key: "patientId",
            label: "Patient ID",
            render: (row) => (
                <span className="font-mono text-xs bg-slate-100 px-2 py-1 rounded text-slate-600">
                    {row.patientId}
                </span>
            ),
        },
        {
            key: "name",
            label: "Patient",
            render: (row) => (
                <div className="flex items-center gap-2.5">
                    <div className="w-8 h-8 rounded-full bg-sky-100 flex items-center justify-center text-sky-600 font-semibold text-sm shrink-0">
                        {row.user?.avatar ? (
                            <img src={row.user.avatar} alt="" className="w-full h-full rounded-full object-cover" />
                        ) : (
                            row.user?.name?.charAt(0)
                        )}
                    </div>
                    <div>
                        <p className="text-sm font-medium text-slate-800">{row.user?.name}</p>
                        <p className="text-xs text-slate-400">{row.user?.email}</p>
                    </div>
                </div>
            ),
        },
        {
            key: "phone",
            label: "Phone",
            render: (row) => <span className="text-sm text-slate-600">{row.user?.phone || "—"}</span>,
        },
        {
            key: "age",
            label: "Age / Gender",
            render: (row) => (
                <span className="text-sm text-slate-600 capitalize">
                    {row.age} yrs / {row.gender}
                </span>
            ),
        },
        {
            key: "bloodGroup",
            label: "Blood Group",
            render: (row) => (
                <span className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-semibold bg-red-50 text-red-600">
                    {row.bloodGroup || "—"}
                </span>
            ),
        },
        {
            key: "isAdmitted",
            label: "Status",
            render: (row) => (
                <Badge
                    label={row.isAdmitted ? "Admitted" : "Outpatient"}
                    className={row.isAdmitted ? "bg-amber-100 text-amber-700" : "bg-green-100 text-green-700"}
                />
            ),
        },
        {
            key: "createdAt",
            label: "Registered",
            render: (row) => <span className="text-sm text-slate-500">{formatDate(row.createdAt)}</span>,
        },
        {
            key: "actions",
            label: "Actions",
            render: (row) => (
                <Button
                    variant="outline"
                    size="sm"
                    icon={Eye}
                    onClick={() => navigate(`/patients/${row._id}`)}
                >
                    View
                </Button>
            ),
        },
    ];

    const totalPages = Math.ceil(total / limit);

    return (
        <div className="space-y-5">

            {/* Header */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                <div>
                    <h1 className="text-2xl font-bold text-slate-800">Patients</h1>
                    <p className="text-sm text-slate-500 mt-0.5">{total} total patients registered</p>
                </div>
                {canAdd && (
                    <Button variant="primary" icon={Plus} onClick={() => navigate("/patients/add")}>
                        Add Patient
                    </Button>
                )}
            </div>

            {/* Filters */}
            <div className="bg-white rounded-2xl border border-slate-100 shadow-sm p-4">
                <div className="relative max-w-sm">
                    <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
                    <input
                        type="text"
                        placeholder="Search patients by name..."
                        value={search}
                        onChange={(e) => { setSearch(e.target.value); setPage(1); }}
                        className="w-full pl-9 pr-4 py-2 rounded-lg border border-slate-200 text-sm text-slate-700 outline-none focus:ring-2 focus:ring-sky-500 focus:border-sky-500 bg-slate-50"
                    />
                </div>
            </div>

            {/* Table */}
            <Table columns={columns} data={list} loading={loading} emptyMessage="No patients found." />

            {/* Pagination */}
            {totalPages > 1 && (
                <div className="flex items-center justify-between px-1">
                    <p className="text-sm text-slate-500">
                        Page {page} of {totalPages}
                    </p>
                    <div className="flex gap-2">
                        <Button
                            variant="outline"
                            size="sm"
                            disabled={page === 1}
                            onClick={() => setPage(page - 1)}
                        >
                            Previous
                        </Button>
                        <Button
                            variant="outline"
                            size="sm"
                            disabled={page === totalPages}
                            onClick={() => setPage(page + 1)}
                        >
                            Next
                        </Button>
                    </div>
                </div>
            )}
        </div>
    );
};

export default PatientList;