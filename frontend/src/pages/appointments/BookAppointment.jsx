// import { useState } from "react";
// import { useDispatch, useSelector } from "react-redux";
// import { useNavigate } from "react-router-dom";
// import { useForm } from "react-hook-form";
// import { zodResolver } from "@hookform/resolvers/zod";
// import { z } from "zod";
// import { createAppointment } from "../../store/slices/appointmentSlice.js";
// import useFetch from "../../hooks/useFetch.js";
// import { ArrowLeft, CalendarDays } from "lucide-react";
// import Button from "../../components/common/Button.jsx";
// import Loader from "../../components/common/Loader.jsx";

// const schema = z.object({
//     patient: z.string().min(1, "Patient is required."),
//     doctor: z.string().min(1, "Doctor is required."),
//     appointmentDate: z.string().min(1, "Date is required."),
//     timeSlot: z.string().min(1, "Time slot is required."),
//     type: z.enum(["opd", "ipd", "emergency"]),
//     reason: z.string().optional(),
// });

// const Field = ({ label, error, children }) => (
//     <div>
//         <label className="block text-sm font-medium text-slate-700 mb-1.5">{label}</label>
//         {children}
//         {error && <p className="text-xs text-red-500 mt-1">{error}</p>}
//     </div>
// );

// const inputClass = (hasError) =>
//     `w-full px-3 py-2.5 rounded-lg border text-sm text-slate-800 outline-none transition-all
//    focus:ring-2 focus:ring-sky-500 focus:border-sky-500 bg-slate-50
//    ${hasError ? "border-red-400 bg-red-50" : "border-slate-200"}`;

// const BookAppointment = () => {
//     const dispatch = useDispatch();
//     const navigate = useNavigate();
//     const { user } = useSelector((state) => state.auth);

//     const [loading, setLoading] = useState(false);
//     const [error, setError] = useState(null);
//     const [selectedDoctor, setSelectedDoctor] = useState(null);

//     const { data: patientsData, loading: pLoading } = useFetch("/patients", { limit: 100 });
//     const { data: doctorsData, loading: dLoading } = useFetch("/doctors", { limit: 100 });

//     const isPatient = user?.role === "patient";

//     const { register, handleSubmit, watch, setValue, formState: { errors } } = useForm({
//         resolver: zodResolver(schema),
//         defaultValues: { type: "opd" },
//     });

//     const watchedDoctor = watch("doctor");

//     const handleDoctorChange = (e) => {
//         const docId = e.target.value;
//         setValue("doctor", docId);
//         const doc = doctorsData?.doctors?.find((d) => d._id === docId);
//         setSelectedDoctor(doc || null);
//     };

//     const generateTimeSlots = (slots) => {
//         if (!slots || slots.length === 0) return [];
//         const times = [];
//         slots.forEach((slot) => {
//             let [startH, startM] = slot.startTime.split(":").map(Number);
//             const [endH, endM] = slot.endTime.split(":").map(Number);
//             while (startH < endH || (startH === endH && startM < endM)) {
//                 const h = startH % 12 || 12;
//                 const m = startM.toString().padStart(2, "0");
//                 const ampm = startH < 12 ? "AM" : "PM";
//                 times.push(`${h}:${m} ${ampm}`);
//                 startM += 30;
//                 if (startM >= 60) { startM -= 60; startH += 1; }
//             }
//         });
//         return times;
//     };

//     const timeSlots = selectedDoctor ? generateTimeSlots(selectedDoctor.availableSlots) : [];

//     const onSubmit = async (data) => {
//         setLoading(true);
//         setError(null);
//         try {
//             let patientId = data.patient;
//             if (isPatient) {
//                 const found = patientsData?.patients?.find((p) => p.user?._id === user._id);
//                 patientId = found?._id;
//                 if (!patientId) throw new Error("Patient profile not found.");
//             }
//             await dispatch(createAppointment({ ...data, patient: patientId })).unwrap();
//             navigate("/appointments");
//         } catch (err) {
//             setError(typeof err === "string" ? err : err?.message || "Failed to book appointment.");
//         } finally {
//             setLoading(false);
//         }
//     };

//     return (
//         <div className="space-y-5 max-w-3xl">

//             {/* Header */}
//             <div className="flex items-center gap-3">
//                 <Button variant="ghost" size="sm" icon={ArrowLeft} onClick={() => navigate("/appointments")}>
//                     Back
//                 </Button>
//                 <div>
//                     <h1 className="text-2xl font-bold text-slate-800">Book Appointment</h1>
//                     <p className="text-sm text-slate-500">Schedule a new appointment</p>
//                 </div>
//             </div>

//             {error && (
//                 <div className="px-4 py-3 bg-red-50 border border-red-200 rounded-lg text-red-600 text-sm">{error}</div>
//             )}

//             <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">

//                 {/* Main Form */}
//                 <div className="bg-white rounded-2xl border border-slate-100 shadow-sm p-6 space-y-4">
//                     <h2 className="text-sm font-semibold text-slate-700 border-b border-slate-100 pb-3">
//                         Appointment Details
//                     </h2>

//                     <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">

//                         {/* Patient Select — hidden for patient role */}
//                         {!isPatient && (
//                             <Field label="Patient" error={errors.patient?.message}>
//                                 {pLoading ? <Loader size="sm" /> : (
//                                     <select {...register("patient")} className={inputClass(errors.patient)}>
//                                         <option value="">Select patient</option>
//                                         {patientsData?.patients?.map((p) => (
//                                             <option key={p._id} value={p._id}>{p.user?.name} — {p.patientId}</option>
//                                         ))}
//                                     </select>
//                                 )}
//                             </Field>
//                         )}

//                         {/* Doctor */}
//                         <Field label="Doctor" error={errors.doctor?.message}>
//                             {dLoading ? <Loader size="sm" /> : (
//                                 <select
//                                     {...register("doctor")}
//                                     onChange={handleDoctorChange}
//                                     className={inputClass(errors.doctor)}
//                                 >
//                                     <option value="">Select doctor</option>
//                                     {doctorsData?.doctors?.filter((d) => d.isAvailable).map((d) => (
//                                         <option key={d._id} value={d._id}>
//                                             Dr. {d.user?.name} — {d.specialization}
//                                         </option>
//                                     ))}
//                                 </select>
//                             )}
//                         </Field>

//                         {/* Date */}
//                         <Field label="Appointment Date" error={errors.appointmentDate?.message}>
//                             <input
//                                 {...register("appointmentDate")}
//                                 type="date"
//                                 min={new Date().toISOString().split("T")[0]}
//                                 className={inputClass(errors.appointmentDate)}
//                             />
//                         </Field>

//                         {/* Time Slot */}
//                         <Field label="Time Slot" error={errors.timeSlot?.message}>
//                             <select
//                                 {...register("timeSlot")}
//                                 disabled={!selectedDoctor}
//                                 className={inputClass(errors.timeSlot)}
//                             >
//                                 <option value="">
//                                     {!selectedDoctor ? "Select a doctor first" : "Select time slot"}
//                                 </option>
//                                 {timeSlots.map((t) => (
//                                     <option key={t} value={t}>{t}</option>
//                                 ))}
//                             </select>
//                         </Field>

//                         {/* Type */}
//                         <Field label="Appointment Type" error={errors.type?.message}>
//                             <select {...register("type")} className={inputClass(errors.type)}>
//                                 <option value="opd">OPD — Outpatient</option>
//                                 <option value="ipd">IPD — Inpatient</option>
//                                 <option value="emergency">Emergency</option>
//                             </select>
//                         </Field>

//                         {/* Reason */}
//                         <Field label="Reason (optional)" error={errors.reason?.message}>
//                             <input
//                                 {...register("reason")}
//                                 placeholder="Brief reason for visit"
//                                 className={inputClass(errors.reason)}
//                             />
//                         </Field>

//                     </div>
//                 </div>

//                 {/* Doctor Info Preview */}
//                 {selectedDoctor && (
//                     <div className="bg-sky-50 border border-sky-100 rounded-2xl p-4 flex items-start gap-4">
//                         <div className="w-12 h-12 rounded-xl bg-sky-100 flex items-center justify-center text-sky-600 font-bold text-lg shrink-0 overflow-hidden">
//                             {selectedDoctor.user?.avatar ? (
//                                 <img src={selectedDoctor.user.avatar} alt="" className="w-full h-full object-cover" />
//                             ) : (
//                                 selectedDoctor.user?.name?.charAt(0)
//                             )}
//                         </div>
//                         <div className="flex-1">
//                             <p className="text-sm font-semibold text-slate-800">Dr. {selectedDoctor.user?.name}</p>
//                             <p className="text-xs text-slate-500">{selectedDoctor.specialization} — {selectedDoctor.department}</p>
//                             <p className="text-xs text-slate-500 mt-1">
//                                 Consultation Fee: <span className="font-semibold text-sky-600">₹{selectedDoctor.consultationFee}</span>
//                             </p>
//                             <p className="text-xs text-slate-500">
//                                 Experience: <span className="font-medium">{selectedDoctor.experience} years</span>
//                             </p>
//                         </div>
//                         <div className="flex items-center gap-1.5">
//                             <CalendarDays size={14} className="text-sky-500" />
//                             <span className="text-xs text-sky-600 font-medium">
//                                 {selectedDoctor.availableSlots?.length} slot{selectedDoctor.availableSlots?.length !== 1 ? "s" : ""}
//                             </span>
//                         </div>
//                     </div>
//                 )}

//                 {/* Actions */}
//                 <div className="flex items-center gap-3 justify-end">
//                     <Button variant="outline" onClick={() => navigate("/appointments")}>Cancel</Button>
//                     <Button type="submit" variant="primary" loading={loading}>Book Appointment</Button>
//                 </div>

//             </form>
//         </div>
//     );
// };

// export default BookAppointment;



//  new
import { useState, useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import { useNavigate } from "react-router-dom";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { createAppointment } from "../../store/slices/appointmentSlice.js";
import useFetch from "../../hooks/useFetch.js";
import { ArrowLeft, CalendarDays } from "lucide-react";
import Button from "../../components/common/Button.jsx";
import Loader from "../../components/common/Loader.jsx";

const schema = z.object({
    patient: z.string().optional(),
    doctor: z.string().min(1, "Doctor is required."),
    appointmentDate: z.string().min(1, "Date is required."),
    timeSlot: z.string().min(1, "Time slot is required."),
    type: z.enum(["opd", "ipd", "emergency"]),
    reason: z.string().optional(),
});

const Field = ({ label, error, children }) => (
    <div>
        <label className="block text-sm font-medium text-slate-700 mb-1.5">{label}</label>
        {children}
        {error && <p className="text-xs text-red-500 mt-1">{error}</p>}
    </div>
);

const inputClass = (hasError) =>
    `w-full px-3 py-2.5 rounded-lg border text-sm text-slate-800 outline-none transition-all
   focus:ring-2 focus:ring-sky-500 focus:border-sky-500 bg-slate-50
   ${hasError ? "border-red-400 bg-red-50" : "border-slate-200"}`;

const BookAppointment = () => {
    const dispatch = useDispatch();
    const navigate = useNavigate();
    const { user } = useSelector((state) => state.auth);

    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);
    const [selectedDoctor, setSelectedDoctor] = useState(null);

    const isPatient = user?.role === "patient";

    // ✅ Patient: fetch only their own profile via /patients/me
    // Staff: fetch full patient list for dropdown
    const { data: myPatientProfile, loading: myProfileLoading } = useFetch(
        isPatient ? "/patients/me" : null
    );
    const { data: patientsData, loading: pLoading } = useFetch(
        !isPatient ? "/patients" : null,
        { limit: 100 }
    );
    const { data: doctorsData, loading: dLoading } = useFetch("/doctors", { limit: 100 });

    const { register, handleSubmit, setValue, formState: { errors } } = useForm({
        resolver: zodResolver(schema),
        defaultValues: { type: "opd" },
    });

    // ✅ Auto-set patient field for patient role — directly from /patients/me, no searching needed
    useEffect(() => {
        if (isPatient && myPatientProfile?._id) {
            setValue("patient", myPatientProfile._id);
        }
    }, [isPatient, myPatientProfile, setValue]);

    const handleDoctorChange = (e) => {
        const docId = e.target.value;
        setValue("doctor", docId);
        const doc = doctorsData?.doctors?.find((d) => d._id === docId);
        setSelectedDoctor(doc || null);
        setValue("timeSlot", "");
    };

    const generateTimeSlots = (slots) => {
        if (!slots || slots.length === 0) return [];
        const times = [];
        slots.forEach((slot) => {
            let [startH, startM] = slot.startTime.split(":").map(Number);
            const [endH, endM] = slot.endTime.split(":").map(Number);
            while (startH < endH || (startH === endH && startM < endM)) {
                const h = startH % 12 || 12;
                const m = startM.toString().padStart(2, "0");
                const ampm = startH < 12 ? "AM" : "PM";
                times.push(`${h}:${m} ${ampm}`);
                startM += 30;
                if (startM >= 60) { startM -= 60; startH += 1; }
            }
        });
        return times;
    };

    const timeSlots = selectedDoctor ? generateTimeSlots(selectedDoctor.availableSlots) : [];

    const onSubmit = async (data) => {
        setLoading(true);
        setError(null);
        try {
            let patientId = data.patient;

            // Fallback in case useEffect hasn't fired yet
            if (isPatient && !patientId) {
                patientId = myPatientProfile?._id;
            }

            if (!patientId) throw new Error("Patient profile not found. Please contact support.");

            await dispatch(createAppointment({ ...data, patient: patientId })).unwrap();
            navigate("/appointments");
        } catch (err) {
            console.error("Appointment booking error:", err);
            setError(typeof err === "string" ? err : err?.message || "Failed to book appointment.");
        } finally {
            setLoading(false);
        }
    };

    const onError = (validationErrors) => {
        console.error("Form validation failed:", validationErrors);
    };

    // Show loader while fetching patient's own profile
    if (isPatient && myProfileLoading) {
        return <div className="flex items-center justify-center h-40"><Loader size="lg" /></div>;
    }

    // Patient account exists but no patient record linked
    if (isPatient && !myProfileLoading && !myPatientProfile?._id) {
        return (
            <div className="max-w-3xl px-4 py-10 text-center space-y-2">
                <p className="text-slate-600 font-medium">No patient profile found.</p>
                <p className="text-slate-400 text-sm">
                    Your account isn't linked to a patient record. Please contact the hospital reception.
                </p>
            </div>
        );
    }

    return (
        <div className="space-y-5 max-w-3xl">

            {/* Header */}
            <div className="flex items-center gap-3">
                <Button variant="ghost" size="sm" icon={ArrowLeft} onClick={() => navigate("/appointments")}>
                    Back
                </Button>
                <div>
                    <h1 className="text-2xl font-bold text-slate-800">Book Appointment</h1>
                    <p className="text-sm text-slate-500">Schedule a new appointment</p>
                </div>
            </div>

            {error && (
                <div className="px-4 py-3 bg-red-50 border border-red-200 rounded-lg text-red-600 text-sm">{error}</div>
            )}

            <form onSubmit={handleSubmit(onSubmit, onError)} className="space-y-5">

                <div className="bg-white rounded-2xl border border-slate-100 shadow-sm p-6 space-y-4">
                    <h2 className="text-sm font-semibold text-slate-700 border-b border-slate-100 pb-3">
                        Appointment Details
                    </h2>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">

                        {/* Staff: patient dropdown */}
                        {!isPatient && (
                            <Field label="Patient" error={errors.patient?.message}>
                                {pLoading ? <Loader size="sm" /> : (
                                    <select {...register("patient")} className={inputClass(errors.patient)}>
                                        <option value="">Select patient</option>
                                        {patientsData?.patients?.map((p) => (
                                            <option key={p._id} value={p._id}>
                                                {p.user?.name} — {p.patientId}
                                            </option>
                                        ))}
                                    </select>
                                )}
                            </Field>
                        )}

                        {/* Patient role: show own name as read-only */}
                        {isPatient && (
                            <Field label="Patient">
                                <input
                                    readOnly
                                    value={myPatientProfile?.user?.name || ""}
                                    className={`${inputClass(false)} bg-slate-100 cursor-not-allowed text-slate-500`}
                                />
                            </Field>
                        )}

                        {/* Doctor */}
                        <Field label="Doctor" error={errors.doctor?.message}>
                            {dLoading ? <Loader size="sm" /> : (
                                <select
                                    {...register("doctor")}
                                    onChange={handleDoctorChange}
                                    className={inputClass(errors.doctor)}
                                >
                                    <option value="">Select doctor</option>
                                    {doctorsData?.doctors?.filter((d) => d.isAvailable).map((d) => (
                                        <option key={d._id} value={d._id}>
                                            Dr. {d.user?.name} — {d.specialization}
                                        </option>
                                    ))}
                                </select>
                            )}
                        </Field>

                        {/* Date */}
                        <Field label="Appointment Date" error={errors.appointmentDate?.message}>
                            <input
                                {...register("appointmentDate")}
                                type="date"
                                min={new Date().toISOString().split("T")[0]}
                                className={inputClass(errors.appointmentDate)}
                            />
                        </Field>

                        {/* Time Slot */}
                        <Field label="Time Slot" error={errors.timeSlot?.message}>
                            <select
                                {...register("timeSlot")}
                                disabled={!selectedDoctor}
                                className={inputClass(errors.timeSlot)}
                            >
                                <option value="">
                                    {!selectedDoctor ? "Select a doctor first" : "Select time slot"}
                                </option>
                                {timeSlots.map((t) => (
                                    <option key={t} value={t}>{t}</option>
                                ))}
                            </select>
                        </Field>

                        {/* Type */}
                        <Field label="Appointment Type" error={errors.type?.message}>
                            <select {...register("type")} className={inputClass(errors.type)}>
                                <option value="opd">OPD — Outpatient</option>
                                <option value="ipd">IPD — Inpatient</option>
                                <option value="emergency">Emergency</option>
                            </select>
                        </Field>

                        {/* Reason */}
                        <Field label="Reason (optional)" error={errors.reason?.message}>
                            <input
                                {...register("reason")}
                                placeholder="Brief reason for visit"
                                className={inputClass(errors.reason)}
                            />
                        </Field>

                    </div>
                </div>

                {/* Doctor Info Preview */}
                {selectedDoctor && (
                    <div className="bg-sky-50 border border-sky-100 rounded-2xl p-4 flex items-start gap-4">
                        <div className="w-12 h-12 rounded-xl bg-sky-100 flex items-center justify-center text-sky-600 font-bold text-lg shrink-0 overflow-hidden">
                            {selectedDoctor.user?.avatar ? (
                                <img src={selectedDoctor.user.avatar} alt="" className="w-full h-full object-cover" />
                            ) : (
                                selectedDoctor.user?.name?.charAt(0)
                            )}
                        </div>
                        <div className="flex-1">
                            <p className="text-sm font-semibold text-slate-800">Dr. {selectedDoctor.user?.name}</p>
                            <p className="text-xs text-slate-500">{selectedDoctor.specialization} — {selectedDoctor.department}</p>
                            <p className="text-xs text-slate-500 mt-1">
                                Consultation Fee: <span className="font-semibold text-sky-600">₹{selectedDoctor.consultationFee}</span>
                            </p>
                            <p className="text-xs text-slate-500">
                                Experience: <span className="font-medium">{selectedDoctor.experience} years</span>
                            </p>
                        </div>
                        <div className="flex items-center gap-1.5">
                            <CalendarDays size={14} className="text-sky-500" />
                            <span className="text-xs text-sky-600 font-medium">
                                {selectedDoctor.availableSlots?.length} slot{selectedDoctor.availableSlots?.length !== 1 ? "s" : ""}
                            </span>
                        </div>
                    </div>
                )}

                {/* Actions */}
                <div className="flex items-center gap-3 justify-end">
                    <Button variant="outline" onClick={() => navigate("/appointments")}>Cancel</Button>
                    <Button type="submit" variant="primary" loading={loading}>Book Appointment</Button>
                </div>

            </form>
        </div>
    );
};

export default BookAppointment;