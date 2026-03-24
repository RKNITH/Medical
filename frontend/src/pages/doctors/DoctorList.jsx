import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useSelector } from "react-redux";
import useFetch from "../../hooks/useFetch.js";
import { Plus, Search, Eye, Star } from "lucide-react";
import Button from "../../components/common/Button.jsx";
import Table from "../../components/common/Table.jsx";
import Badge from "../../components/common/Badge.jsx";
import { DEPARTMENTS } from "../../utils/constants.js";

const DoctorList = () => {
    const navigate = useNavigate();
    const { user } = useSelector((state) => state.auth);

    const [search, setSearch] = useState("");
    const [department, setDepartment] = useState("");
    const [page, setPage] = useState(1);
    const limit = 10;

    const { data, loading, refetch } = useFetch("/doctors", { department, page, limit });

    const canAdd = ["super_admin", "admin"].includes(user?.role);

    useEffect(() => {
        refetch();
    }, [department, page]);

    const filtered = data?.doctors?.filter((d) =>
        search
            ? d.user?.name?.toLowerCase().includes(search.toLowerCase()) ||
            d.specialization?.toLowerCase().includes(search.toLowerCase())
            : true
    );

    const columns = [
        {
            key: "doctor",
            label: "Doctor",
            render: (row) => (
                <div className="flex items-center gap-2.5">
                    <div className="w-9 h-9 rounded-full bg-violet-100 flex items-center justify-center text-violet-600 font-semibold text-sm shrink-0 overflow-hidden">
                        {row.user?.avatar ? (
                            <img src={row.user.avatar} alt="" className="w-full h-full object-cover rounded-full" />
                        ) : (
                            row.user?.name?.charAt(0)
                        )}
                    </div>
                    <div>
                        <p className="text-sm font-medium text-slate-800">Dr. {row.user?.name}</p>
                        <p className="text-xs text-slate-400">{row.user?.email}</p>
                    </div>
                </div>
            ),
        },
        {
            key: "doctorId",
            label: "Doctor ID",
            render: (row) => (
                <span className="font-mono text-xs bg-slate-100 px-2 py-1 rounded text-slate-600">
                    {row.doctorId}
                </span>
            ),
        },
        {
            key: "specialization",
            label: "Specialization",
            render: (row) => <span className="text-sm text-slate-600">{row.specialization}</span>,
        },
        {
            key: "department",
            label: "Department",
            render: (row) => (
                <span className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium bg-violet-50 text-violet-700">
                    {row.department}
                </span>
            ),
        },
        {
            key: "experience",
            label: "Experience",
            render: (row) => (
                <span className="text-sm text-slate-600">{row.experience} yrs</span>
            ),
        },
        {
            key: "consultationFee",
            label: "Fee",
            render: (row) => (
                <span className="text-sm font-semibold text-slate-700">₹{row.consultationFee}</span>
            ),
        },
        {
            key: "isAvailable",
            label: "Status",
            render: (row) => (
                <Badge
                    label={row.isAvailable ? "Available" : "Unavailable"}
                    className={row.isAvailable ? "bg-green-100 text-green-700" : "bg-red-100 text-red-700"}
                />
            ),
        },
        {
            key: "actions",
            label: "Actions",
            render: (row) => (
                <Button
                    variant="outline"
                    size="sm"
                    icon={Eye}
                    onClick={() => navigate(`/doctors/${row._id}`)}
                >
                    View
                </Button>
            ),
        },
    ];

    const totalPages = Math.ceil((data?.total || 0) / limit);

    return (
        <div className="space-y-5">

            {/* Header */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                <div>
                    <h1 className="text-2xl font-bold text-slate-800">Doctors</h1>
                    <p className="text-sm text-slate-500 mt-0.5">{data?.total || 0} doctors on staff</p>
                </div>
                {canAdd && (
                    <Button variant="primary" icon={Plus} onClick={() => navigate("/doctors/add")}>
                        Add Doctor
                    </Button>
                )}
            </div>

            {/* Filters */}
            <div className="bg-white rounded-2xl border border-slate-100 shadow-sm p-4 flex flex-col sm:flex-row gap-3">
                <div className="relative flex-1 max-w-sm">
                    <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
                    <input
                        type="text"
                        placeholder="Search by name or specialization..."
                        value={search}
                        onChange={(e) => setSearch(e.target.value)}
                        className="w-full pl-9 pr-4 py-2 rounded-lg border border-slate-200 text-sm text-slate-700 outline-none focus:ring-2 focus:ring-sky-500 focus:border-sky-500 bg-slate-50"
                    />
                </div>
                <select
                    value={department}
                    onChange={(e) => { setDepartment(e.target.value); setPage(1); }}
                    className="px-3 py-2 rounded-lg border border-slate-200 text-sm text-slate-700 outline-none focus:ring-2 focus:ring-sky-500 bg-slate-50"
                >
                    <option value="">All Departments</option>
                    {DEPARTMENTS.map((d) => (
                        <option key={d} value={d}>{d}</option>
                    ))}
                </select>
            </div>

            {/* Table */}
            <Table
                columns={columns}
                data={filtered || []}
                loading={loading}
                emptyMessage="No doctors found."
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
        </div>
    );
};

export default DoctorList;