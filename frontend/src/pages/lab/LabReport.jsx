// import { useState } from "react";
// import { useParams, useNavigate } from "react-router-dom";
// import { useSelector } from "react-redux";
// import { useForm } from "react-hook-form";
// import { zodResolver } from "@hookform/resolvers/zod";
// import { z } from "zod";
// import api from "../../api/axios.js";
// import useFetch from "../../hooks/useFetch.js";
// import {
//     ArrowLeft, FlaskConical, Upload,
//     CheckCircle, Clock, AlertCircle, User,
// } from "lucide-react";
// import Button from "../../components/common/Button.jsx";
// import Badge from "../../components/common/Badge.jsx";
// import Loader from "../../components/common/Loader.jsx";
// import { LAB_STATUS_COLOR } from "../../utils/constants.js";
// import { formatDate, formatDateTime } from "../../utils/formatDate.js";

// const schema = z.object({
//     result: z.string().min(2, "Result is required."),
//     notes: z.string().optional(),
// });

// const inputClass = (hasError) =>
//     `w-full px-3 py-2.5 rounded-lg border text-sm text-slate-800 outline-none transition-all
//    focus:ring-2 focus:ring-sky-500 focus:border-sky-500 bg-slate-50
//    ${hasError ? "border-red-400 bg-red-50" : "border-slate-200"}`;

// const StatusStep = ({ label, done, active }) => (
//     <div className="flex items-center gap-2">
//         <div className={`w-7 h-7 rounded-full flex items-center justify-center shrink-0 text-xs font-bold transition-colors
//       ${done ? "bg-emerald-500 text-white" : active ? "bg-sky-500 text-white" : "bg-slate-100 text-slate-400"}`}>
//             {done ? <CheckCircle size={14} /> : active ? <Clock size={14} /> : "·"}
//         </div>
//         <span className={`text-sm ${done || active ? "text-slate-700 font-medium" : "text-slate-400"}`}>
//             {label}
//         </span>
//     </div>
// );

// const LabReport = () => {
//     const { id } = useParams();
//     const navigate = useNavigate();
//     const { user } = useSelector((state) => state.auth);

//     const { data: test, loading, refetch } = useFetch(`/lab/${id}`);
//     const [uploading, setUploading] = useState(false);
//     const [uploadError, setUploadError] = useState(null);
//     const [file, setFile] = useState(null);

//     const isLabTech = user?.role === "lab_technician";
//     const isAdmin = ["super_admin", "admin"].includes(user?.role);
//     const canUpload = (isLabTech || isAdmin) && test?.status !== "completed";

//     const { register, handleSubmit, formState: { errors } } = useForm({
//         resolver: zodResolver(schema),
//     });

//     const onUpload = async (data) => {
//         setUploading(true);
//         setUploadError(null);
//         try {
//             const formData = new FormData();
//             formData.append("result", data.result);
//             if (data.notes) formData.append("notes", data.notes);
//             if (file) formData.append("report", file);

//             await api.put(`/lab/${id}/result`, formData, {
//                 headers: { "Content-Type": "multipart/form-data" },
//             });
//             await refetch();
//         } catch (err) {
//             setUploadError(err.response?.data?.message || "Failed to upload result.");
//         } finally {
//             setUploading(false);
//         }
//     };

//     if (loading) return (
//         <div className="h-64 flex items-center justify-center"><Loader size="lg" /></div>
//     );

//     if (!test) return (
//         <p className="text-center text-slate-400 mt-20">Lab test not found.</p>
//     );

//     const statusOrder = ["pending", "sample_collected", "in_progress", "completed"];
//     const currentIndex = statusOrder.indexOf(test.status);

//     return (
//         <div className="space-y-5 max-w-4xl">

//             {/* Header */}
//             <div className="flex items-center gap-3">
//                 <Button variant="ghost" size="sm" icon={ArrowLeft} onClick={() => navigate("/lab")}>
//                     Back
//                 </Button>
//                 <div>
//                     <h1 className="text-2xl font-bold text-slate-800">{test.testName}</h1>
//                     {test.testCode && (
//                         <p className="text-sm text-slate-500 font-mono">{test.testCode}</p>
//                     )}
//                 </div>
//             </div>

//             {/* Status Progress */}
//             <div className="bg-white rounded-2xl border border-slate-100 shadow-sm p-5">
//                 <p className="text-sm font-semibold text-slate-700 mb-4">Test Progress</p>
//                 <div className="flex flex-wrap gap-4 items-center">
//                     {statusOrder.map((s, i) => (
//                         <div key={s} className="flex items-center gap-2">
//                             <StatusStep
//                                 label={s.replace(/_/g, " ").replace(/\b\w/g, (c) => c.toUpperCase())}
//                                 done={i < currentIndex}
//                                 active={i === currentIndex}
//                             />
//                             {i < statusOrder.length - 1 && (
//                                 <div className={`w-8 h-0.5 ${i < currentIndex ? "bg-emerald-300" : "bg-slate-200"}`} />
//                             )}
//                         </div>
//                     ))}
//                 </div>
//             </div>

//             {/* Test Details */}
//             <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">

//                 {/* Left — Info */}
//                 <div className="bg-white rounded-2xl border border-slate-100 shadow-sm p-5 space-y-4">
//                     <p className="text-sm font-semibold text-slate-700 border-b border-slate-50 pb-3">Test Information</p>

//                     <div className="space-y-3">
//                         <div className="flex items-center gap-3 p-3 bg-slate-50 rounded-xl">
//                             <User size={15} className="text-slate-400 shrink-0" />
//                             <div>
//                                 <p className="text-xs text-slate-400">Patient</p>
//                                 <p className="text-sm font-medium text-slate-700">{test.patient?.user?.name}</p>
//                                 <p className="text-xs text-slate-400 font-mono">{test.patient?.patientId}</p>
//                             </div>
//                         </div>

//                         <div className="flex items-center gap-3 p-3 bg-slate-50 rounded-xl">
//                             <User size={15} className="text-slate-400 shrink-0" />
//                             <div>
//                                 <p className="text-xs text-slate-400">Ordered By</p>
//                                 <p className="text-sm font-medium text-slate-700">Dr. {test.doctor?.user?.name}</p>
//                             </div>
//                         </div>

//                         <div className="flex items-center gap-3 p-3 bg-slate-50 rounded-xl">
//                             <FlaskConical size={15} className="text-slate-400 shrink-0" />
//                             <div>
//                                 <p className="text-xs text-slate-400">Price</p>
//                                 <p className="text-sm font-semibold text-slate-700">₹{test.price}</p>
//                             </div>
//                         </div>

//                         <div className="grid grid-cols-2 gap-3">
//                             <div className="p-3 bg-slate-50 rounded-xl">
//                                 <p className="text-xs text-slate-400">Ordered On</p>
//                                 <p className="text-sm font-medium text-slate-700">{formatDate(test.createdAt)}</p>
//                             </div>
//                             {test.collectedAt && (
//                                 <div className="p-3 bg-slate-50 rounded-xl">
//                                     <p className="text-xs text-slate-400">Collected At</p>
//                                     <p className="text-sm font-medium text-slate-700">{formatDateTime(test.collectedAt)}</p>
//                                 </div>
//                             )}
//                             {test.completedAt && (
//                                 <div className="p-3 bg-emerald-50 rounded-xl col-span-2">
//                                     <p className="text-xs text-emerald-500">Completed At</p>
//                                     <p className="text-sm font-medium text-emerald-700">{formatDateTime(test.completedAt)}</p>
//                                 </div>
//                             )}
//                         </div>

//                         <div className="flex items-center justify-between">
//                             <span className="text-sm text-slate-500">Status</span>
//                             <Badge label={test.status} className={LAB_STATUS_COLOR[test.status]} />
//                         </div>
//                     </div>
//                 </div>

//                 {/* Right — Result */}
//                 <div className="space-y-4">

//                     {/* Completed Result */}
//                     {test.status === "completed" && (
//                         <div className="bg-white rounded-2xl border border-slate-100 shadow-sm p-5 space-y-3">
//                             <div className="flex items-center gap-2 border-b border-slate-50 pb-3">
//                                 <CheckCircle size={16} className="text-emerald-500" />
//                                 <p className="text-sm font-semibold text-slate-700">Test Result</p>
//                             </div>
//                             <div className="p-4 bg-emerald-50 rounded-xl">
//                                 <p className="text-sm text-emerald-800 leading-relaxed">{test.result}</p>
//                             </div>
//                             {test.notes && (
//                                 <div>
//                                     <p className="text-xs text-slate-400 mb-1">Notes</p>
//                                     <p className="text-sm text-slate-600 bg-slate-50 p-3 rounded-xl">{test.notes}</p>
//                                 </div>
//                             )}
//                             {test.reportUrl && (
//                                 <a
//                                     href={test.reportUrl}
//                                     target="_blank"
//                                     rel="noreferrer"
//                                     className="inline-flex items-center gap-2 px-4 py-2 bg-sky-500 text-white text-sm font-medium rounded-lg hover:bg-sky-600 transition-colors"
//                                 >
//                                     <Upload size={14} /> View Report File
//                                 </a>
//                             )}
//                         </div>
//                     )}

//                     {/* Upload Result Form */}
//                     {canUpload && (
//                         <div className="bg-white rounded-2xl border border-slate-100 shadow-sm p-5">
//                             <div className="flex items-center gap-2 border-b border-slate-50 pb-3 mb-4">
//                                 <Upload size={16} className="text-sky-500" />
//                                 <p className="text-sm font-semibold text-slate-700">Upload Result</p>
//                             </div>

//                             {uploadError && (
//                                 <div className="mb-4 px-4 py-3 bg-red-50 border border-red-200 rounded-lg text-red-600 text-sm">
//                                     {uploadError}
//                                 </div>
//                             )}

//                             <form onSubmit={handleSubmit(onUpload)} className="space-y-4">
//                                 <div>
//                                     <label className="block text-sm font-medium text-slate-700 mb-1.5">Result Summary</label>
//                                     <textarea
//                                         {...register("result")}
//                                         placeholder="Enter test result details..."
//                                         rows={4}
//                                         className={`${inputClass(errors.result)} resize-none`}
//                                     />
//                                     {errors.result && (
//                                         <p className="text-xs text-red-500 mt-1">{errors.result.message}</p>
//                                     )}
//                                 </div>

//                                 <div>
//                                     <label className="block text-sm font-medium text-slate-700 mb-1.5">
//                                         Additional Notes (optional)
//                                     </label>
//                                     <input
//                                         {...register("notes")}
//                                         placeholder="Any additional notes..."
//                                         className={inputClass(false)}
//                                     />
//                                 </div>

//                                 <div>
//                                     <label className="block text-sm font-medium text-slate-700 mb-1.5">
//                                         Report File (optional — PDF/Image)
//                                     </label>
//                                     <div className="flex items-center gap-3">
//                                         <label className="flex items-center gap-2 px-4 py-2.5 rounded-lg border border-dashed border-slate-300 bg-slate-50 hover:bg-slate-100 cursor-pointer transition-colors text-sm text-slate-600 flex-1">
//                                             <Upload size={15} className="text-slate-400" />
//                                             {file ? file.name : "Click to upload file"}
//                                             <input
//                                                 type="file"
//                                                 accept=".pdf,.jpg,.jpeg,.png"
//                                                 className="hidden"
//                                                 onChange={(e) => setFile(e.target.files[0])}
//                                             />
//                                         </label>
//                                         {file && (
//                                             <button
//                                                 type="button"
//                                                 onClick={() => setFile(null)}
//                                                 className="p-2 rounded-lg hover:bg-red-50 text-slate-400 hover:text-red-500 transition-colors"
//                                             >
//                                                 ✕
//                                             </button>
//                                         )}
//                                     </div>
//                                 </div>

//                                 <Button type="submit" variant="primary" loading={uploading} className="w-full">
//                                     Submit Result
//                                 </Button>
//                             </form>
//                         </div>
//                     )}

//                     {/* Pending message for non-lab staff */}
//                     {!canUpload && test.status !== "completed" && (
//                         <div className="bg-white rounded-2xl border border-slate-100 shadow-sm p-8 flex flex-col items-center gap-3">
//                             <div className="w-12 h-12 rounded-2xl bg-amber-50 flex items-center justify-center">
//                                 <AlertCircle size={22} className="text-amber-500" />
//                             </div>
//                             <p className="text-sm font-medium text-slate-700">Result Pending</p>
//                             <p className="text-xs text-slate-400 text-center">
//                                 The lab technician is processing this test. You will be notified when the result is ready.
//                             </p>
//                             <Badge label={test.status} className={LAB_STATUS_COLOR[test.status]} />
//                         </div>
//                     )}
//                 </div>
//             </div>
//         </div>
//     );
// };

// export default LabReport;







import { useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { useSelector } from "react-redux";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import api from "../../api/axios.js";
import useFetch from "../../hooks/useFetch.js";
import {
    ArrowLeft, FlaskConical, Upload, FileText,
    CheckCircle, Clock, AlertCircle, User,
    Stethoscope, ExternalLink, IndianRupee,
} from "lucide-react";
import Button from "../../components/common/Button.jsx";
import Badge from "../../components/common/Badge.jsx";
import Loader from "../../components/common/Loader.jsx";
import { LAB_STATUS_COLOR } from "../../utils/constants.js";
import { formatDate, formatDateTime } from "../../utils/formatDate.js";

const schema = z.object({
    result: z.string().min(2, "Result summary is required."),
    notes: z.string().optional(),
});

const inputCls = (err) =>
    `w-full px-3 py-2.5 rounded-lg border text-sm text-slate-800 outline-none transition-all
     focus:ring-2 focus:ring-sky-500 focus:border-sky-500 bg-slate-50
     ${err ? "border-red-400 bg-red-50" : "border-slate-200"}`;

// ── Status progress stepper ───────────────────────────────────
const statusOrder = ["pending", "sample_collected", "in_progress", "completed"];
const statusLabels = ["Pending", "Sample Collected", "In Progress", "Completed"];

const Stepper = ({ currentStatus }) => {
    const currentIndex = statusOrder.indexOf(currentStatus);
    return (
        <div className="bg-white rounded-2xl border border-slate-100 shadow-sm p-5">
            <p className="text-sm font-semibold text-slate-700 mb-5">Test Progress</p>
            <div className="flex items-center gap-0">
                {statusOrder.map((s, i) => {
                    const done = i < currentIndex;
                    const active = i === currentIndex;
                    return (
                        <div key={s} className="flex items-center flex-1 last:flex-none">
                            <div className="flex flex-col items-center gap-1.5">
                                <div className={`w-8 h-8 rounded-full flex items-center justify-center shrink-0 text-xs font-bold transition-all
                                    ${done ? "bg-emerald-500 text-white shadow-sm shadow-emerald-200"
                                        : active ? "bg-sky-500 text-white shadow-sm shadow-sky-200 ring-4 ring-sky-100"
                                            : "bg-slate-100 text-slate-400"}`}
                                >
                                    {done ? <CheckCircle size={14} /> : active ? <Clock size={14} /> : i + 1}
                                </div>
                                <span className={`text-xs font-medium text-center leading-tight max-w-16
                                    ${done || active ? "text-slate-700" : "text-slate-400"}`}
                                >
                                    {statusLabels[i]}
                                </span>
                            </div>
                            {i < statusOrder.length - 1 && (
                                <div className={`flex-1 h-0.5 mb-5 mx-1 transition-colors
                                    ${i < currentIndex ? "bg-emerald-400" : "bg-slate-200"}`}
                                />
                            )}
                        </div>
                    );
                })}
            </div>
        </div>
    );
};

// ── Info row helper ───────────────────────────────────────────
const InfoBlock = ({ icon: Icon, label, value, sub, color = "bg-slate-50" }) => (
    <div className={`flex items-center gap-3 p-3 ${color} rounded-xl`}>
        <div className="w-8 h-8 rounded-lg bg-white flex items-center justify-center shrink-0 shadow-sm">
            <Icon size={14} className="text-slate-400" />
        </div>
        <div>
            <p className="text-xs text-slate-400">{label}</p>
            <p className="text-sm font-medium text-slate-700">{value || "—"}</p>
            {sub && <p className="text-xs text-slate-400 font-mono">{sub}</p>}
        </div>
    </div>
);

const LabReport = () => {
    const { id } = useParams();
    const navigate = useNavigate();
    const { user } = useSelector((state) => state.auth);

    const { data: test, loading, refetch } = useFetch(`/lab/${id}`);

    const [uploading, setUploading] = useState(false);
    const [uploadError, setUploadError] = useState(null);
    const [uploadSuccess, setUploadSuccess] = useState(false);
    const [file, setFile] = useState(null);

    const isLabTech = user?.role === "lab_technician";
    const isAdmin = ["super_admin", "admin"].includes(user?.role);
    const isDoctor = user?.role === "doctor";
    const isPatient = user?.role === "patient";

    const canUpload = (isLabTech || isAdmin) && test?.status !== "completed";

    const { register, handleSubmit, reset, formState: { errors } } = useForm({
        resolver: zodResolver(schema),
    });

    const onUpload = async (data) => {
        setUploading(true);
        setUploadError(null);
        setUploadSuccess(false);
        try {
            const formData = new FormData();
            formData.append("result", data.result);
            if (data.notes) formData.append("notes", data.notes);
            if (file) formData.append("report", file);

            await api.put(`/lab/${id}/result`, formData, {
                headers: { "Content-Type": "multipart/form-data" },
            });
            setUploadSuccess(true);
            setFile(null);
            reset();
            await refetch();
        } catch (err) {
            setUploadError(err.response?.data?.message || "Failed to upload result.");
        } finally {
            setUploading(false);
        }
    };

    if (loading) return (
        <div className="h-64 flex items-center justify-center"><Loader size="lg" /></div>
    );
    if (!test) return (
        <div className="flex flex-col items-center justify-center mt-20 gap-3">
            <AlertCircle size={40} className="text-red-400" />
            <p className="text-slate-600">Lab test not found.</p>
        </div>
    );

    const isCompleted = test.status === "completed";

    return (
        <div className="space-y-5 max-w-4xl">
            {/* Header */}
            <div className="flex items-center gap-3">
                <Button variant="ghost" size="sm" icon={ArrowLeft} onClick={() => navigate("/lab")}>
                    Back
                </Button>
                <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-3 flex-wrap">
                        <h1 className="text-2xl font-bold text-slate-800">{test.testName}</h1>
                        <Badge label={test.status} className={LAB_STATUS_COLOR[test.status]} />
                    </div>
                    {test.testCode && (
                        <p className="text-sm text-slate-400 font-mono mt-0.5">{test.testCode}</p>
                    )}
                </div>
            </div>

            {/* Stepper */}
            <Stepper currentStatus={test.status} />

            {/* Main content */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">

                {/* Left: Test Information */}
                <div className="bg-white rounded-2xl border border-slate-100 shadow-sm p-5 space-y-3">
                    <p className="text-sm font-semibold text-slate-700 border-b border-slate-50 pb-3">
                        Test Information
                    </p>

                    <InfoBlock
                        icon={User}
                        label="Patient"
                        value={test.patient?.user?.name}
                        sub={test.patient?.patientId}
                    />
                    <InfoBlock
                        icon={Stethoscope}
                        label="Ordered By"
                        value={`Dr. ${test.doctor?.user?.name || "—"}`}
                    />
                    <InfoBlock
                        icon={IndianRupee}
                        label="Test Price"
                        value={`₹${test.price}`}
                    />
                    <InfoBlock
                        icon={FlaskConical}
                        label="Ordered On"
                        value={formatDate(test.createdAt)}
                    />

                    {test.collectedAt && (
                        <InfoBlock
                            icon={Clock}
                            label="Sample Collected"
                            value={formatDateTime(test.collectedAt)}
                            color="bg-sky-50"
                        />
                    )}

                    {test.completedAt && (
                        <InfoBlock
                            icon={CheckCircle}
                            label="Completed At"
                            value={formatDateTime(test.completedAt)}
                            color="bg-emerald-50"
                        />
                    )}

                    {test.processedBy && (
                        <InfoBlock
                            icon={User}
                            label="Processed By"
                            value={test.processedBy?.name}
                        />
                    )}

                    {test.notes && !isCompleted && (
                        <div className="p-3 bg-amber-50 rounded-xl">
                            <p className="text-xs text-amber-600 mb-1">Notes</p>
                            <p className="text-sm text-amber-800">{test.notes}</p>
                        </div>
                    )}
                </div>

                {/* Right: Result Section */}
                <div className="space-y-4">

                    {/* COMPLETED State */}
                    {isCompleted && (
                        <div className="bg-white rounded-2xl border border-slate-100 shadow-sm p-5 space-y-4">
                            <div className="flex items-center gap-2 border-b border-slate-50 pb-3">
                                <div className="w-8 h-8 rounded-lg bg-emerald-50 flex items-center justify-center shrink-0">
                                    <CheckCircle size={16} className="text-emerald-500" />
                                </div>
                                <div>
                                    <p className="text-sm font-semibold text-slate-700">Test Result</p>
                                    <p className="text-xs text-slate-400">
                                        Completed {formatDateTime(test.completedAt)}
                                    </p>
                                </div>
                            </div>

                            {test.result ? (
                                <div className="p-4 bg-emerald-50 border border-emerald-100 rounded-xl">
                                    <p className="text-xs font-semibold text-emerald-600 uppercase tracking-wider mb-2">
                                        Result Summary
                                    </p>
                                    <p className="text-sm text-emerald-900 leading-relaxed whitespace-pre-line">
                                        {test.result}
                                    </p>
                                </div>
                            ) : (
                                <div className="p-4 bg-slate-50 rounded-xl">
                                    <p className="text-sm text-slate-400">No result text provided.</p>
                                </div>
                            )}

                            {test.notes && (
                                <div className="p-3 bg-slate-50 rounded-xl">
                                    <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider mb-1">
                                        Lab Notes
                                    </p>
                                    <p className="text-sm text-slate-600 leading-relaxed">{test.notes}</p>
                                </div>
                            )}

                            {/* TYPO FIXED HERE: Added missing <a> tag */}
                            {test.reportUrl ? (
                                <a
                                    href={test.reportUrl}
                                    target="_blank"
                                    rel="noreferrer"
                                    className="flex items-center gap-2 px-4 py-3 bg-sky-500 text-white text-sm font-medium rounded-xl hover:bg-sky-600 transition-colors w-full justify-center"
                                >
                                    <FileText size={16} />
                                    View Full Report
                                    <ExternalLink size={14} />
                                </a>
                            ) : (
                                <div className="flex items-center gap-2 px-4 py-3 bg-slate-50 text-slate-400 text-sm rounded-xl">
                                    <FileText size={16} />
                                    No report file attached
                                </div>
                            )}

                            {test.processedBy && (
                                <p className="text-xs text-slate-400 text-center">
                                    Processed by{" "}
                                    <span className="font-medium text-slate-600">
                                        {test.processedBy?.name}
                                    </span>
                                </p>
                            )}
                        </div>
                    )}

                    {/* LAB TECH: upload form */}
                    {canUpload && (
                        <div className="bg-white rounded-2xl border border-slate-100 shadow-sm p-5">
                            <div className="flex items-center gap-2 border-b border-slate-50 pb-3 mb-4">
                                <div className="w-8 h-8 rounded-lg bg-sky-50 flex items-center justify-center shrink-0">
                                    <Upload size={16} className="text-sky-500" />
                                </div>
                                <div>
                                    <p className="text-sm font-semibold text-slate-700">Upload Result</p>
                                    <p className="text-xs text-slate-400">
                                        Patient and doctor will be notified automatically
                                    </p>
                                </div>
                            </div>

                            {uploadError && (
                                <div className="mb-4 px-4 py-3 bg-red-50 border border-red-200 rounded-xl text-red-600 text-sm flex items-center gap-2">
                                    <AlertCircle size={15} />
                                    {uploadError}
                                </div>
                            )}

                            {uploadSuccess && (
                                <div className="mb-4 px-4 py-3 bg-emerald-50 border border-emerald-200 rounded-xl text-emerald-700 text-sm flex items-center gap-2">
                                    <CheckCircle size={15} />
                                    Result uploaded successfully. Patient has been notified.
                                </div>
                            )}

                            <form onSubmit={handleSubmit(onUpload)} className="space-y-4">
                                <div>
                                    <label className="block text-sm font-medium text-slate-700 mb-1.5">
                                        Result Summary <span className="text-red-400">*</span>
                                    </label>
                                    <textarea
                                        {...register("result")}
                                        placeholder="e.g. Hemoglobin: 13.5 g/dL..."
                                        rows={5}
                                        className={`${inputCls(errors.result)} resize-none`}
                                    />
                                    {errors.result && (
                                        <p className="text-xs text-red-500 mt-1">{errors.result.message}</p>
                                    )}
                                </div>

                                <div>
                                    <label className="block text-sm font-medium text-slate-700 mb-1.5">
                                        Lab Notes <span className="text-slate-400 font-normal">(optional)</span>
                                    </label>
                                    <input
                                        {...register("notes")}
                                        placeholder="e.g. Sample was slightly hemolyzed..."
                                        className={inputCls(false)}
                                    />
                                </div>

                                <div>
                                    <label className="block text-sm font-medium text-slate-700 mb-1.5">
                                        Report File <span className="text-slate-400 font-normal">(optional — PDF or image)</span>
                                    </label>
                                    <div className="flex items-center gap-3">
                                        <label className="flex items-center gap-2 px-4 py-3 rounded-xl border-2 border-dashed border-slate-200 bg-slate-50 hover:bg-slate-100 hover:border-sky-300 cursor-pointer transition-all text-sm text-slate-500 flex-1">
                                            <Upload size={16} className="text-slate-400 shrink-0" />
                                            <span className="truncate">
                                                {file ? file.name : "Click to upload PDF or image"}
                                            </span>
                                            <input
                                                type="file"
                                                accept=".pdf,.jpg,.jpeg,.png"
                                                className="hidden"
                                                onChange={(e) => setFile(e.target.files[0])}
                                            />
                                        </label>
                                        {file && (
                                            <button
                                                type="button"
                                                onClick={() => setFile(null)}
                                                className="p-2 rounded-lg hover:bg-red-50 text-slate-400 hover:text-red-500 transition-colors shrink-0"
                                            >
                                                ✕
                                            </button>
                                        )}
                                    </div>
                                </div>

                                <Button
                                    type="submit"
                                    variant="primary"
                                    loading={uploading}
                                    className="w-full"
                                >
                                    Submit Result & Notify Patient
                                </Button>
                            </form>
                        </div>
                    )}

                    {/* Pending State for Patient/Doctor */}
                    {!canUpload && !isCompleted && (
                        <div className="bg-white rounded-2xl border border-slate-100 shadow-sm p-8 flex flex-col items-center gap-4">
                            <div className="w-16 h-16 rounded-2xl bg-amber-50 flex items-center justify-center">
                                <FlaskConical size={28} className="text-amber-500" />
                            </div>
                            <div className="text-center">
                                <p className="text-sm font-semibold text-slate-700 mb-1">
                                    Result Not Ready Yet
                                </p>
                                <p className="text-xs text-slate-400 leading-relaxed max-w-xs">
                                    {isPatient
                                        ? "The lab is processing your sample. You will receive a notification when your result is ready."
                                        : isDoctor
                                            ? "The lab technician is processing this sample. You will be notified when the result is uploaded."
                                            : "Awaiting lab technician to process and upload the result."
                                    }
                                </p>
                            </div>
                            <Badge label={test.status} className={LAB_STATUS_COLOR[test.status]} />
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};

export default LabReport;