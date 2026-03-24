// import { useState } from "react";
// import { useSelector } from "react-redux";
// import { useForm, useFieldArray } from "react-hook-form";
// import { zodResolver } from "@hookform/resolvers/zod";
// import { z } from "zod";
// import api from "../../api/axios.js";
// import useFetch from "../../hooks/useFetch.js";
// import {
//     Plus, Trash2, Download, FileText,
//     Search, ChevronDown, ChevronUp,
// } from "lucide-react";
// import Button from "../../components/common/Button.jsx";
// import Modal from "../../components/common/Modal.jsx";
// import Loader from "../../components/common/Loader.jsx";
// import Badge from "../../components/common/Badge.jsx";
// import { formatDate } from "../../utils/formatDate.js";

// // ── Schema ────────────────────────────────────────────────────
// const schema = z.object({
//     appointment: z.string().min(1, "Appointment is required."),
//     patient: z.string().min(1, "Patient is required."),
//     diagnosis: z.string().min(2, "Diagnosis is required."),
//     notes: z.string().optional(),
//     followUpDate: z.string().optional(),
//     medicines: z.array(z.object({
//         name: z.string().min(1, "Medicine name required."),
//         dosage: z.string().min(1, "Dosage required."),
//         duration: z.string().min(1, "Duration required."),
//         instruction: z.string().optional(),
//     })).min(1, "At least one medicine is required."),
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

// // ── Prescription Card ─────────────────────────────────────────
// const PrescriptionCard = ({ rx, onDownload }) => {
//     const [expanded, setExpanded] = useState(false);

//     return (
//         <div className="bg-white rounded-2xl border border-slate-100 shadow-sm overflow-hidden">
//             <div
//                 className="flex items-center justify-between p-4 cursor-pointer hover:bg-slate-50 transition-colors"
//                 onClick={() => setExpanded(!expanded)}
//             >
//                 <div className="flex items-center gap-3">
//                     <div className="w-10 h-10 rounded-xl bg-sky-50 flex items-center justify-center shrink-0">
//                         <FileText size={18} className="text-sky-500" />
//                     </div>
//                     <div>
//                         <p className="text-sm font-semibold text-slate-800">{rx.diagnosis}</p>
//                         <p className="text-xs text-slate-400">
//                             Dr. {rx.doctor?.user?.name} — {formatDate(rx.createdAt)}
//                         </p>
//                     </div>
//                 </div>
//                 <div className="flex items-center gap-3">
//                     <Button
//                         variant="outline"
//                         size="sm"
//                         icon={Download}
//                         onClick={(e) => { e.stopPropagation(); onDownload(rx._id); }}
//                     >
//                         PDF
//                     </Button>
//                     {expanded ? <ChevronUp size={16} className="text-slate-400" /> : <ChevronDown size={16} className="text-slate-400" />}
//                 </div>
//             </div>

//             {expanded && (
//                 <div className="px-4 pb-4 border-t border-slate-50 pt-4 space-y-4">

//                     {/* Medicines */}
//                     <div>
//                         <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider mb-2">Medicines</p>
//                         <div className="space-y-2">
//                             {rx.medicines?.map((med, i) => (
//                                 <div key={i} className="flex items-start gap-3 p-3 bg-slate-50 rounded-xl">
//                                     <div className="w-6 h-6 rounded-full bg-sky-100 flex items-center justify-center text-sky-600 text-xs font-bold shrink-0">
//                                         {i + 1}
//                                     </div>
//                                     <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 flex-1">
//                                         <div>
//                                             <p className="text-xs text-slate-400">Medicine</p>
//                                             <p className="text-sm font-medium text-slate-700">{med.name}</p>
//                                         </div>
//                                         <div>
//                                             <p className="text-xs text-slate-400">Dosage</p>
//                                             <p className="text-sm text-slate-700">{med.dosage}</p>
//                                         </div>
//                                         <div>
//                                             <p className="text-xs text-slate-400">Duration</p>
//                                             <p className="text-sm text-slate-700">{med.duration}</p>
//                                         </div>
//                                         <div>
//                                             <p className="text-xs text-slate-400">Instruction</p>
//                                             <p className="text-sm text-slate-700">{med.instruction || "—"}</p>
//                                         </div>
//                                     </div>
//                                 </div>
//                             ))}
//                         </div>
//                     </div>

//                     {/* Notes & Follow Up */}
//                     <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
//                         {rx.notes && (
//                             <div>
//                                 <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider mb-1">Notes</p>
//                                 <p className="text-sm text-slate-600 bg-slate-50 p-3 rounded-xl">{rx.notes}</p>
//                             </div>
//                         )}
//                         {rx.followUpDate && (
//                             <div>
//                                 <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider mb-1">Follow Up</p>
//                                 <p className="text-sm text-slate-600 bg-amber-50 text-amber-700 p-3 rounded-xl font-medium">
//                                     {formatDate(rx.followUpDate)}
//                                 </p>
//                             </div>
//                         )}
//                     </div>
//                 </div>
//             )}
//         </div>
//     );
// };

// // ── Main Component ────────────────────────────────────────────
// const Prescription = () => {
//     const { user } = useSelector((state) => state.auth);
//     const isDoctor = user?.role === "doctor";
//     const isPatient = user?.role === "patient";

//     const [modalOpen, setModalOpen] = useState(false);
//     const [submitting, setSubmitting] = useState(false);
//     const [submitError, setSubmitError] = useState(null);
//     const [searchPatient, setSearchPatient] = useState("");
//     const [selectedPatientId, setSelectedPatientId] = useState(null);

//     // For doctor — fetch their appointments
//     const { data: appointmentsData } = useFetch(
//         isDoctor ? `/appointments/doctor/${user._id}` : null
//     );

//     // For patient — fetch their own prescriptions
//     const { data: patientProfile } = useFetch(
//         isPatient ? `/patients` : null,
//         isPatient ? { limit: 100 } : {}
//     );

//     const myPatient = patientProfile?.patients?.find((p) => p.user?._id === user?._id);

//     const { data: prescriptions, loading, refetch } = useFetch(
//         isPatient && myPatient?._id
//             ? `/prescriptions/patient/${myPatient._id}`
//             : selectedPatientId
//                 ? `/prescriptions/patient/${selectedPatientId}`
//                 : null
//     );

//     const { data: patientsData } = useFetch(
//         isDoctor ? "/patients" : null,
//         isDoctor ? { limit: 100 } : {}
//     );

//     const { register, handleSubmit, control, watch, setValue, reset, formState: { errors } } = useForm({
//         resolver: zodResolver(schema),
//         defaultValues: { medicines: [{ name: "", dosage: "", duration: "", instruction: "" }] },
//     });

//     const { fields, append, remove } = useFieldArray({ control, name: "medicines" });

//     const watchedAppointment = watch("appointment");

//     const handleAppointmentChange = (e) => {
//         const apptId = e.target.value;
//         setValue("appointment", apptId);
//         const appt = appointmentsData?.find((a) => a._id === apptId);
//         if (appt) setValue("patient", appt.patient?._id);
//     };

//     const onSubmit = async (data) => {
//         setSubmitting(true);
//         setSubmitError(null);
//         try {
//             await api.post("/prescriptions", data);
//             reset({ medicines: [{ name: "", dosage: "", duration: "", instruction: "" }] });
//             setModalOpen(false);
//             refetch();
//         } catch (err) {
//             setSubmitError(err.response?.data?.message || "Failed to create prescription.");
//         } finally {
//             setSubmitting(false);
//         }
//     };

//     const handleDownload = (id) => {
//         window.open(`${import.meta.env.VITE_API_URL}/prescriptions/${id}/pdf`, "_blank");
//     };

//     const filteredPatients = patientsData?.patients?.filter((p) =>
//         p.user?.name?.toLowerCase().includes(searchPatient.toLowerCase())
//     );

//     return (
//         <div className="space-y-5">

//             {/* Header */}
//             <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
//                 <div>
//                     <h1 className="text-2xl font-bold text-slate-800">Prescriptions</h1>
//                     <p className="text-sm text-slate-500 mt-0.5">
//                         {isDoctor ? "Create and manage prescriptions" : "View your prescriptions"}
//                     </p>
//                 </div>
//                 {isDoctor && (
//                     <Button variant="primary" icon={Plus} onClick={() => setModalOpen(true)}>
//                         New Prescription
//                     </Button>
//                 )}
//             </div>

//             {/* Doctor — Patient Search */}
//             {isDoctor && (
//                 <div className="bg-white rounded-2xl border border-slate-100 shadow-sm p-4">
//                     <p className="text-sm font-medium text-slate-700 mb-3">Search Patient Prescriptions</p>
//                     <div className="flex flex-col sm:flex-row gap-3">
//                         <div className="relative flex-1 max-w-sm">
//                             <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
//                             <input
//                                 type="text"
//                                 placeholder="Search patient by name..."
//                                 value={searchPatient}
//                                 onChange={(e) => setSearchPatient(e.target.value)}
//                                 className="w-full pl-9 pr-4 py-2 rounded-lg border border-slate-200 text-sm text-slate-700 outline-none focus:ring-2 focus:ring-sky-500 bg-slate-50"
//                             />
//                         </div>
//                         {searchPatient && filteredPatients?.length > 0 && (
//                             <div className="flex flex-wrap gap-2">
//                                 {filteredPatients.slice(0, 5).map((p) => (
//                                     <button
//                                         key={p._id}
//                                         onClick={() => { setSelectedPatientId(p._id); setSearchPatient(""); }}
//                                         className={`px-3 py-1.5 rounded-lg text-sm border transition-colors
//                       ${selectedPatientId === p._id
//                                                 ? "bg-sky-500 text-white border-sky-500"
//                                                 : "bg-white text-slate-700 border-slate-200 hover:border-sky-300"}`}
//                                     >
//                                         {p.user?.name}
//                                     </button>
//                                 ))}
//                             </div>
//                         )}
//                     </div>
//                 </div>
//             )}

//             {/* Prescriptions List */}
//             {loading ? (
//                 <div className="h-40 flex items-center justify-center"><Loader size="lg" /></div>
//             ) : !prescriptions || prescriptions.length === 0 ? (
//                 <div className="bg-white rounded-2xl border border-slate-100 shadow-sm p-12 flex flex-col items-center gap-3">
//                     <div className="w-14 h-14 rounded-2xl bg-slate-50 flex items-center justify-center">
//                         <FileText size={28} className="text-slate-300" />
//                     </div>
//                     <p className="text-slate-500 text-sm">
//                         {isPatient
//                             ? "No prescriptions found."
//                             : selectedPatientId
//                                 ? "No prescriptions for this patient."
//                                 : "Search a patient to view their prescriptions."}
//                     </p>
//                 </div>
//             ) : (
//                 <div className="space-y-3">
//                     {prescriptions.map((rx) => (
//                         <PrescriptionCard key={rx._id} rx={rx} onDownload={handleDownload} />
//                     ))}
//                 </div>
//             )}

//             {/* Create Prescription Modal */}
//             <Modal
//                 isOpen={modalOpen}
//                 onClose={() => { setModalOpen(false); reset(); setSubmitError(null); }}
//                 title="New Prescription"
//                 size="xl"
//             >
//                 <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">

//                     {submitError && (
//                         <div className="px-4 py-3 bg-red-50 border border-red-200 rounded-lg text-red-600 text-sm">
//                             {submitError}
//                         </div>
//                     )}

//                     {/* Appointment & Patient */}
//                     <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
//                         <Field label="Appointment" error={errors.appointment?.message}>
//                             <select
//                                 {...register("appointment")}
//                                 onChange={handleAppointmentChange}
//                                 className={inputClass(errors.appointment)}
//                             >
//                                 <option value="">Select appointment</option>
//                                 {appointmentsData
//                                     ?.filter((a) => a.status === "in_progress" || a.status === "scheduled")
//                                     .map((a) => (
//                                         <option key={a._id} value={a._id}>
//                                             {a.patient?.user?.name} — {formatDate(a.appointmentDate)}
//                                         </option>
//                                     ))}
//                             </select>
//                         </Field>

//                         <Field label="Diagnosis" error={errors.diagnosis?.message}>
//                             <input
//                                 {...register("diagnosis")}
//                                 placeholder="e.g. Hypertension, Type 2 Diabetes"
//                                 className={inputClass(errors.diagnosis)}
//                             />
//                         </Field>

//                         <Field label="Follow Up Date (optional)">
//                             <input
//                                 {...register("followUpDate")}
//                                 type="date"
//                                 min={new Date().toISOString().split("T")[0]}
//                                 className={inputClass(false)}
//                             />
//                         </Field>

//                         <Field label="Notes (optional)">
//                             <input
//                                 {...register("notes")}
//                                 placeholder="Additional notes for patient"
//                                 className={inputClass(false)}
//                             />
//                         </Field>
//                     </div>

//                     {/* Hidden patient field */}
//                     <input type="hidden" {...register("patient")} />

//                     {/* Medicines */}
//                     <div>
//                         <div className="flex items-center justify-between mb-3">
//                             <p className="text-sm font-semibold text-slate-700">Medicines</p>
//                             <Button
//                                 type="button"
//                                 variant="outline"
//                                 size="sm"
//                                 icon={Plus}
//                                 onClick={() => append({ name: "", dosage: "", duration: "", instruction: "" })}
//                             >
//                                 Add Medicine
//                             </Button>
//                         </div>

//                         {errors.medicines?.root && (
//                             <p className="text-xs text-red-500 mb-2">{errors.medicines.root.message}</p>
//                         )}

//                         <div className="space-y-3">
//                             {fields.map((field, index) => (
//                                 <div key={field.id} className="p-4 bg-slate-50 rounded-xl space-y-3">
//                                     <div className="flex items-center justify-between">
//                                         <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider">
//                                             Medicine {index + 1}
//                                         </p>
//                                         {fields.length > 1 && (
//                                             <button
//                                                 type="button"
//                                                 onClick={() => remove(index)}
//                                                 className="p-1 rounded-lg hover:bg-red-50 text-slate-400 hover:text-red-500 transition-colors"
//                                             >
//                                                 <Trash2 size={14} />
//                                             </button>
//                                         )}
//                                     </div>
//                                     <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
//                                         <div>
//                                             <input
//                                                 {...register(`medicines.${index}.name`)}
//                                                 placeholder="Medicine name"
//                                                 className={inputClass(errors.medicines?.[index]?.name)}
//                                             />
//                                             {errors.medicines?.[index]?.name && (
//                                                 <p className="text-xs text-red-500 mt-1">{errors.medicines[index].name.message}</p>
//                                             )}
//                                         </div>
//                                         <div>
//                                             <input
//                                                 {...register(`medicines.${index}.dosage`)}
//                                                 placeholder="Dosage (e.g. 500mg)"
//                                                 className={inputClass(errors.medicines?.[index]?.dosage)}
//                                             />
//                                             {errors.medicines?.[index]?.dosage && (
//                                                 <p className="text-xs text-red-500 mt-1">{errors.medicines[index].dosage.message}</p>
//                                             )}
//                                         </div>
//                                         <div>
//                                             <input
//                                                 {...register(`medicines.${index}.duration`)}
//                                                 placeholder="Duration (e.g. 7 days)"
//                                                 className={inputClass(errors.medicines?.[index]?.duration)}
//                                             />
//                                             {errors.medicines?.[index]?.duration && (
//                                                 <p className="text-xs text-red-500 mt-1">{errors.medicines[index].duration.message}</p>
//                                             )}
//                                         </div>
//                                         <div>
//                                             <input
//                                                 {...register(`medicines.${index}.instruction`)}
//                                                 placeholder="Instruction (e.g. After meal)"
//                                                 className={inputClass(false)}
//                                             />
//                                         </div>
//                                     </div>
//                                 </div>
//                             ))}
//                         </div>
//                     </div>

//                     {/* Actions */}
//                     <div className="flex items-center gap-3 justify-end pt-2">
//                         <Button variant="outline" type="button" onClick={() => { setModalOpen(false); reset(); }}>
//                             Cancel
//                         </Button>
//                         <Button type="submit" variant="primary" loading={submitting}>
//                             Create Prescription
//                         </Button>
//                     </div>

//                 </form>
//             </Modal>

//         </div>
//     );
// };

// export default Prescription;









import { useState } from "react";
import { useSelector } from "react-redux";
import { useForm, useFieldArray } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import api from "../../api/axios.js";
import useFetch from "../../hooks/useFetch.js";
import {
    Plus, Trash2, Download, FileText,
    Search, ChevronDown, ChevronUp,
} from "lucide-react";
import Button from "../../components/common/Button.jsx";
import Modal from "../../components/common/Modal.jsx";
import Loader from "../../components/common/Loader.jsx";
import { formatDate } from "../../utils/formatDate.js";

const schema = z.object({
    appointment: z.string().min(1, "Appointment is required."),
    patient: z.string().min(1, "Patient is required."),
    diagnosis: z.string().min(2, "Diagnosis is required."),
    notes: z.string().optional(),
    followUpDate: z.string().optional(),
    medicines: z.array(z.object({
        name: z.string().min(1, "Medicine name required."),
        dosage: z.string().min(1, "Dosage required."),
        duration: z.string().min(1, "Duration required."),
        instruction: z.string().optional(),
    })).min(1, "At least one medicine is required."),
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

// ── Prescription Card ─────────────────────────────────────────
const PrescriptionCard = ({ rx, onDownload, showPatient = false }) => {
    const [expanded, setExpanded] = useState(false);

    return (
        <div className="bg-white rounded-2xl border border-slate-100 shadow-sm overflow-hidden">
            <div
                className="flex items-center justify-between p-4 cursor-pointer hover:bg-slate-50 transition-colors"
                onClick={() => setExpanded(!expanded)}
            >
                <div className="flex items-center gap-3 min-w-0">
                    <div className="w-10 h-10 rounded-xl bg-sky-50 flex items-center justify-center shrink-0">
                        <FileText size={18} className="text-sky-500" />
                    </div>
                    <div className="min-w-0">
                        <p className="text-sm font-semibold text-slate-800 truncate">{rx.diagnosis}</p>
                        <p className="text-xs text-slate-400">
                            {showPatient
                                ? `${rx.patient?.user?.name} — ${formatDate(rx.createdAt)}`
                                : `Dr. ${rx.doctor?.user?.name} — ${formatDate(rx.createdAt)}`
                            }
                        </p>
                    </div>
                </div>
                <div className="flex items-center gap-2 shrink-0 ml-2">
                    <Button
                        variant="outline"
                        size="sm"
                        icon={Download}
                        onClick={(e) => { e.stopPropagation(); onDownload(rx._id); }}
                    >
                        <span className="hidden sm:inline">PDF</span>
                    </Button>
                    {expanded
                        ? <ChevronUp size={16} className="text-slate-400" />
                        : <ChevronDown size={16} className="text-slate-400" />
                    }
                </div>
            </div>

            {expanded && (
                <div className="px-4 pb-4 border-t border-slate-50 pt-4 space-y-4">
                    <div>
                        <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider mb-2">
                            Medicines
                        </p>
                        <div className="space-y-2">
                            {rx.medicines?.map((med, i) => (
                                <div key={i} className="flex items-start gap-3 p-3 bg-slate-50 rounded-xl">
                                    <div className="w-6 h-6 rounded-full bg-sky-100 flex items-center justify-center text-sky-600 text-xs font-bold shrink-0">
                                        {i + 1}
                                    </div>
                                    <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 flex-1">
                                        <div>
                                            <p className="text-xs text-slate-400">Medicine</p>
                                            <p className="text-sm font-medium text-slate-700">{med.name}</p>
                                        </div>
                                        <div>
                                            <p className="text-xs text-slate-400">Dosage</p>
                                            <p className="text-sm text-slate-700">{med.dosage}</p>
                                        </div>
                                        <div>
                                            <p className="text-xs text-slate-400">Duration</p>
                                            <p className="text-sm text-slate-700">{med.duration}</p>
                                        </div>
                                        <div>
                                            <p className="text-xs text-slate-400">Instruction</p>
                                            <p className="text-sm text-slate-700">{med.instruction || "—"}</p>
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                        {rx.notes && (
                            <div>
                                <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider mb-1">Notes</p>
                                <p className="text-sm text-slate-600 bg-slate-50 p-3 rounded-xl">{rx.notes}</p>
                            </div>
                        )}
                        {rx.followUpDate && (
                            <div>
                                <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider mb-1">Follow Up</p>
                                <p className="text-sm bg-amber-50 text-amber-700 p-3 rounded-xl font-medium">
                                    {formatDate(rx.followUpDate)}
                                </p>
                            </div>
                        )}
                    </div>
                </div>
            )}
        </div>
    );
};

// ── Main Component ────────────────────────────────────────────
const Prescription = () => {
    const { user } = useSelector((state) => state.auth);
    const isDoctor = user?.role === "doctor";
    const isPatient = user?.role === "patient";

    const [modalOpen, setModalOpen] = useState(false);
    const [submitting, setSubmitting] = useState(false);
    const [submitError, setSubmitError] = useState(null);
    const [searchPatient, setSearchPatient] = useState("");
    const [selectedPatientId, setSelectedPatientId] = useState(null);

    // ── Step 1: resolve own profile ───────────────────────────
    const { data: myPatientProfile, loading: patientProfileLoading } = useFetch(
        isPatient ? "/patients/me" : null
    );
    const { data: myDoctorProfile } = useFetch(
        isDoctor ? "/doctors/me" : null
    );

    // ── Step 2: doctor — fetch own appointments using Doctor._id
    const { data: appointmentsData } = useFetch(
        isDoctor && myDoctorProfile?._id
            ? `/appointments/doctor/${myDoctorProfile._id}`
            : null
    );

    // ── Step 3: fetch prescriptions ───────────────────────────
    // Patient — always fetch their own
    const { data: patientPrescriptions, loading: patientRxLoading } = useFetch(
        isPatient && myPatientProfile?._id
            ? `/prescriptions/patient/${myPatientProfile._id}`
            : null
    );

    // Doctor — fetch ALL their own prescriptions by default
    const { data: doctorPrescriptions, loading: doctorRxLoading, refetch: refetchDoctorRx } = useFetch(
        isDoctor && myDoctorProfile?._id
            ? `/prescriptions/doctor/${myDoctorProfile._id}`
            : null
    );

    // Doctor — fetch selected patient's prescriptions when searching
    const { data: selectedPatientRx, loading: selectedRxLoading } = useFetch(
        isDoctor && selectedPatientId
            ? `/prescriptions/patient/${selectedPatientId}`
            : null
    );

    // ── Patients list for create form & search ─────────────────
    const { data: patientsData } = useFetch(
        isDoctor ? "/patients" : null,
        { limit: 200 }
    );

    const { register, handleSubmit, control, watch, setValue, reset, formState: { errors } } = useForm({
        resolver: zodResolver(schema),
        defaultValues: {
            medicines: [{ name: "", dosage: "", duration: "", instruction: "" }],
        },
    });

    const { fields, append, remove } = useFieldArray({ control, name: "medicines" });

    const handleAppointmentChange = (e) => {
        const apptId = e.target.value;
        setValue("appointment", apptId);
        // auto-fill patient from appointment
        const appt = appointmentsData?.find((a) => a._id === apptId);
        if (appt?.patient?._id) setValue("patient", appt.patient._id);
    };

    const onSubmit = async (data) => {
        setSubmitting(true);
        setSubmitError(null);
        try {
            // doctor is resolved server-side — don't send it
            await api.post("/prescriptions", {
                appointment: data.appointment,
                patient: data.patient,
                diagnosis: data.diagnosis,
                medicines: data.medicines,
                notes: data.notes,
                followUpDate: data.followUpDate,
            });
            reset({ medicines: [{ name: "", dosage: "", duration: "", instruction: "" }] });
            setModalOpen(false);
            refetchDoctorRx();
        } catch (err) {
            setSubmitError(err.response?.data?.message || "Failed to create prescription.");
        } finally {
            setSubmitting(false);
        }
    };

    const handleDownload = (id) => {
        window.open(`${import.meta.env.VITE_API_URL}/prescriptions/${id}/pdf`, "_blank");
    };

    // filtered search results
    const filteredPatients = patientsData?.patients?.filter((p) =>
        p.user?.name?.toLowerCase().includes(searchPatient.toLowerCase())
    );

    // which prescriptions to show for doctor
    const displayedPrescriptions = selectedPatientId
        ? selectedPatientRx
        : doctorPrescriptions;
    const displayedLoading = selectedPatientId
        ? selectedRxLoading
        : doctorRxLoading;

    // ── Patient loading state ─────────────────────────────────
    if (isPatient && patientProfileLoading) {
        return <div className="h-64 flex items-center justify-center"><Loader size="lg" /></div>;
    }

    return (
        <div className="space-y-5">

            {/* Header */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                <div>
                    <h1 className="text-2xl font-bold text-slate-800">Prescriptions</h1>
                    <p className="text-sm text-slate-500 mt-0.5">
                        {isDoctor ? "Create and manage prescriptions" : "Your prescriptions"}
                    </p>
                </div>
                {isDoctor && (
                    <Button variant="primary" icon={Plus} onClick={() => setModalOpen(true)}>
                        New Prescription
                    </Button>
                )}
            </div>

            {/* Doctor — Patient Search */}
            {isDoctor && (
                <div className="bg-white rounded-2xl border border-slate-100 shadow-sm p-4">
                    <div className="flex items-center justify-between mb-3">
                        <p className="text-sm font-medium text-slate-700">Filter by Patient</p>
                        {selectedPatientId && (
                            <button
                                onClick={() => { setSelectedPatientId(null); setSearchPatient(""); }}
                                className="text-xs text-sky-500 hover:underline flex items-center gap-1"
                            >
                                Clear filter — show all my prescriptions
                            </button>
                        )}
                    </div>
                    <div className="relative max-w-sm">
                        <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
                        <input
                            type="text"
                            placeholder="Search patient by name..."
                            value={searchPatient}
                            onChange={(e) => setSearchPatient(e.target.value)}
                            className="w-full pl-9 pr-4 py-2 rounded-lg border border-slate-200 text-sm text-slate-700 outline-none focus:ring-2 focus:ring-sky-500 bg-slate-50"
                        />
                    </div>
                    {searchPatient && filteredPatients?.length > 0 && (
                        <div className="flex flex-wrap gap-2 mt-2">
                            {filteredPatients.slice(0, 8).map((p) => (
                                <button
                                    key={p._id}
                                    onClick={() => { setSelectedPatientId(p._id); setSearchPatient(""); }}
                                    className={`px-3 py-1.5 rounded-lg text-sm border transition-colors
                                        ${selectedPatientId === p._id
                                            ? "bg-sky-500 text-white border-sky-500"
                                            : "bg-white text-slate-700 border-slate-200 hover:border-sky-300"
                                        }`}
                                >
                                    {p.user?.name}
                                </button>
                            ))}
                        </div>
                    )}
                    {searchPatient && filteredPatients?.length === 0 && (
                        <p className="text-xs text-slate-400 mt-2">No patients found.</p>
                    )}
                </div>
            )}

            {/* Prescriptions List */}
            {isPatient ? (
                patientRxLoading ? (
                    <div className="h-40 flex items-center justify-center"><Loader size="lg" /></div>
                ) : !patientPrescriptions?.length ? (
                    <EmptyState message="No prescriptions found." />
                ) : (
                    <div className="space-y-3">
                        {patientPrescriptions.map((rx) => (
                            <PrescriptionCard key={rx._id} rx={rx} onDownload={handleDownload} showPatient={false} />
                        ))}
                    </div>
                )
            ) : (
                displayedLoading ? (
                    <div className="h-40 flex items-center justify-center"><Loader size="lg" /></div>
                ) : !displayedPrescriptions?.length ? (
                    <EmptyState message={
                        selectedPatientId
                            ? "No prescriptions for this patient."
                            : "No prescriptions written yet."
                    } />
                ) : (
                    <div className="space-y-3">
                        {displayedPrescriptions.map((rx) => (
                            <PrescriptionCard
                                key={rx._id}
                                rx={rx}
                                onDownload={handleDownload}
                                showPatient={true}
                            />
                        ))}
                    </div>
                )
            )}

            {/* Create Prescription Modal */}
            <Modal
                isOpen={modalOpen}
                onClose={() => { setModalOpen(false); reset(); setSubmitError(null); }}
                title="New Prescription"
                size="xl"
            >
                <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">

                    {submitError && (
                        <div className="px-4 py-3 bg-red-50 border border-red-200 rounded-lg text-red-600 text-sm">
                            {submitError}
                        </div>
                    )}

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">

                        {/* Appointment — uses Doctor._id resolved appointments */}
                        <Field label="Appointment" error={errors.appointment?.message}>
                            <select
                                {...register("appointment")}
                                onChange={handleAppointmentChange}
                                className={inputCls(errors.appointment)}
                            >
                                <option value="">Select appointment</option>
                                {!myDoctorProfile?._id ? (
                                    <option disabled>Loading doctor profile...</option>
                                ) : !appointmentsData?.length ? (
                                    <option disabled>No appointments found</option>
                                ) : (
                                    appointmentsData
                                        .filter((a) => ["in_progress", "scheduled"].includes(a.status))
                                        .map((a) => (
                                            <option key={a._id} value={a._id}>
                                                {a.patient?.user?.name} — {formatDate(a.appointmentDate)} {a.timeSlot}
                                            </option>
                                        ))
                                )}
                            </select>
                        </Field>

                        <Field label="Diagnosis" error={errors.diagnosis?.message}>
                            <input
                                {...register("diagnosis")}
                                placeholder="e.g. Hypertension, Type 2 Diabetes"
                                className={inputCls(errors.diagnosis)}
                            />
                        </Field>

                        <Field label="Follow Up Date (optional)">
                            <input
                                {...register("followUpDate")}
                                type="date"
                                min={new Date().toISOString().split("T")[0]}
                                className={inputCls(false)}
                            />
                        </Field>

                        <Field label="Notes (optional)">
                            <input
                                {...register("notes")}
                                placeholder="Additional notes for patient"
                                className={inputCls(false)}
                            />
                        </Field>
                    </div>

                    {/* Hidden patient field — auto-filled from appointment */}
                    <input type="hidden" {...register("patient")} />
                    {errors.patient && (
                        <p className="text-xs text-red-500 -mt-3">
                            Please select an appointment to auto-fill patient.
                        </p>
                    )}

                    {/* Medicines */}
                    <div>
                        <div className="flex items-center justify-between mb-3">
                            <p className="text-sm font-semibold text-slate-700">Medicines</p>
                            <Button
                                type="button"
                                variant="outline"
                                size="sm"
                                icon={Plus}
                                onClick={() => append({ name: "", dosage: "", duration: "", instruction: "" })}
                            >
                                Add Medicine
                            </Button>
                        </div>

                        {errors.medicines?.root && (
                            <p className="text-xs text-red-500 mb-2">{errors.medicines.root.message}</p>
                        )}

                        <div className="space-y-3">
                            {fields.map((field, index) => (
                                <div key={field.id} className="p-4 bg-slate-50 rounded-xl space-y-3">
                                    <div className="flex items-center justify-between">
                                        <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider">
                                            Medicine {index + 1}
                                        </p>
                                        {fields.length > 1 && (
                                            <button
                                                type="button"
                                                onClick={() => remove(index)}
                                                className="p-1 rounded-lg hover:bg-red-50 text-slate-400 hover:text-red-500 transition-colors"
                                            >
                                                <Trash2 size={14} />
                                            </button>
                                        )}
                                    </div>
                                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
                                        <div>
                                            <input
                                                {...register(`medicines.${index}.name`)}
                                                placeholder="Medicine name"
                                                className={inputCls(errors.medicines?.[index]?.name)}
                                            />
                                            {errors.medicines?.[index]?.name && (
                                                <p className="text-xs text-red-500 mt-1">
                                                    {errors.medicines[index].name.message}
                                                </p>
                                            )}
                                        </div>
                                        <div>
                                            <input
                                                {...register(`medicines.${index}.dosage`)}
                                                placeholder="Dosage (e.g. 500mg)"
                                                className={inputCls(errors.medicines?.[index]?.dosage)}
                                            />
                                            {errors.medicines?.[index]?.dosage && (
                                                <p className="text-xs text-red-500 mt-1">
                                                    {errors.medicines[index].dosage.message}
                                                </p>
                                            )}
                                        </div>
                                        <div>
                                            <input
                                                {...register(`medicines.${index}.duration`)}
                                                placeholder="Duration (e.g. 7 days)"
                                                className={inputCls(errors.medicines?.[index]?.duration)}
                                            />
                                            {errors.medicines?.[index]?.duration && (
                                                <p className="text-xs text-red-500 mt-1">
                                                    {errors.medicines[index].duration.message}
                                                </p>
                                            )}
                                        </div>
                                        <div>
                                            <input
                                                {...register(`medicines.${index}.instruction`)}
                                                placeholder="e.g. After meal"
                                                className={inputCls(false)}
                                            />
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>

                    <div className="flex items-center gap-3 justify-end pt-2">
                        <Button
                            variant="outline"
                            type="button"
                            onClick={() => { setModalOpen(false); reset(); setSubmitError(null); }}
                        >
                            Cancel
                        </Button>
                        <Button type="submit" variant="primary" loading={submitting}>
                            Create Prescription
                        </Button>
                    </div>
                </form>
            </Modal>

        </div>
    );
};

// ── Empty state helper ────────────────────────────────────────
const EmptyState = ({ message }) => (
    <div className="bg-white rounded-2xl border border-slate-100 shadow-sm p-12 flex flex-col items-center gap-3">
        <div className="w-14 h-14 rounded-2xl bg-slate-50 flex items-center justify-center">
            <FileText size={28} className="text-slate-300" />
        </div>
        <p className="text-slate-500 text-sm">{message}</p>
    </div>
);

export default Prescription;

