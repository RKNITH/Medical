import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useForm, useFieldArray } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import api from "../../api/axios.js";
import { ArrowLeft, Plus, Trash2 } from "lucide-react";
import Button from "../../components/common/Button.jsx";
import { DEPARTMENTS } from "../../utils/constants.js";

const schema = z.object({
    name: z.string().min(2, "Name is required."),
    email: z.string().email("Valid email required."),
    password: z.string().min(6, "Min 6 characters."),
    phone: z.string().min(10, "Valid phone required."),
    specialization: z.string().min(2, "Specialization is required."),
    department: z.string().min(1, "Department is required."),
    experience: z.coerce.number().min(0),
    consultationFee: z.coerce.number().min(1, "Fee is required."),
    qualification: z.string().optional(),
    availableSlots: z.array(z.object({
        day: z.string().min(1, "Day is required."),
        startTime: z.string().min(1, "Start time required."),
        endTime: z.string().min(1, "End time required."),
    })).optional(),
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

const DAYS = ["monday", "tuesday", "wednesday", "thursday", "friday", "saturday", "sunday"];

const AddDoctor = () => {
    const navigate = useNavigate();
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);

    const { register, handleSubmit, control, formState: { errors } } = useForm({
        resolver: zodResolver(schema),
        defaultValues: { availableSlots: [] },
    });

    const { fields, append, remove } = useFieldArray({ control, name: "availableSlots" });

    const onSubmit = async (data) => {
        setLoading(true);
        setError(null);
        try {
            const payload = {
                ...data,
                qualification: data.qualification ? data.qualification.split(",").map((q) => q.trim()) : [],
            };
            await api.post("/doctors", payload);
            navigate("/doctors");
        } catch (err) {
            setError(err.response?.data?.message || "Failed to add doctor.");
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="space-y-5 max-w-4xl">

            {/* Header */}
            <div className="flex items-center gap-3">
                <Button variant="ghost" size="sm" icon={ArrowLeft} onClick={() => navigate("/doctors")}>
                    Back
                </Button>
                <div>
                    <h1 className="text-2xl font-bold text-slate-800">Add Doctor</h1>
                    <p className="text-sm text-slate-500">Register a new doctor to the system</p>
                </div>
            </div>

            {error && (
                <div className="px-4 py-3 bg-red-50 border border-red-200 rounded-lg text-red-600 text-sm">{error}</div>
            )}

            <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">

                {/* Account Info */}
                <div className="bg-white rounded-2xl border border-slate-100 shadow-sm p-6 space-y-4">
                    <h2 className="text-sm font-semibold text-slate-700 border-b border-slate-100 pb-3">Account Information</h2>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                        <Field label="Full Name" error={errors.name?.message}>
                            <input {...register("name")} placeholder="Dr. John Smith" className={inputClass(errors.name)} />
                        </Field>
                        <Field label="Email Address" error={errors.email?.message}>
                            <input {...register("email")} type="email" placeholder="doctor@hospital.com" className={inputClass(errors.email)} />
                        </Field>
                        <Field label="Password" error={errors.password?.message}>
                            <input {...register("password")} type="password" placeholder="Min 6 characters" className={inputClass(errors.password)} />
                        </Field>
                        <Field label="Phone Number" error={errors.phone?.message}>
                            <input {...register("phone")} placeholder="+91 9876543210" className={inputClass(errors.phone)} />
                        </Field>
                    </div>
                </div>

                {/* Professional Info */}
                <div className="bg-white rounded-2xl border border-slate-100 shadow-sm p-6 space-y-4">
                    <h2 className="text-sm font-semibold text-slate-700 border-b border-slate-100 pb-3">Professional Information</h2>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                        <Field label="Specialization" error={errors.specialization?.message}>
                            <input {...register("specialization")} placeholder="Cardiologist" className={inputClass(errors.specialization)} />
                        </Field>
                        <Field label="Department" error={errors.department?.message}>
                            <select {...register("department")} className={inputClass(errors.department)}>
                                <option value="">Select department</option>
                                {DEPARTMENTS.map((d) => <option key={d} value={d}>{d}</option>)}
                            </select>
                        </Field>
                        <Field label="Experience (years)" error={errors.experience?.message}>
                            <input {...register("experience")} type="number" placeholder="5" className={inputClass(errors.experience)} />
                        </Field>
                        <Field label="Consultation Fee (₹)" error={errors.consultationFee?.message}>
                            <input {...register("consultationFee")} type="number" placeholder="500" className={inputClass(errors.consultationFee)} />
                        </Field>
                        <Field label="Qualifications (comma separated)" error={errors.qualification?.message}>
                            <input {...register("qualification")} placeholder="MBBS, MD, DM" className={inputClass(errors.qualification)} />
                        </Field>
                    </div>
                </div>

                {/* Available Slots */}
                <div className="bg-white rounded-2xl border border-slate-100 shadow-sm p-6 space-y-4">
                    <div className="flex items-center justify-between border-b border-slate-100 pb-3">
                        <h2 className="text-sm font-semibold text-slate-700">Available Slots</h2>
                        <Button
                            type="button"
                            variant="outline"
                            size="sm"
                            icon={Plus}
                            onClick={() => append({ day: "", startTime: "", endTime: "" })}
                        >
                            Add Slot
                        </Button>
                    </div>

                    {fields.length === 0 && (
                        <p className="text-sm text-slate-400 text-center py-4">No slots added. Click "Add Slot" to add availability.</p>
                    )}

                    <div className="space-y-3">
                        {fields.map((field, index) => (
                            <div key={field.id} className="grid grid-cols-1 sm:grid-cols-4 gap-3 p-3 bg-slate-50 rounded-xl">
                                <select
                                    {...register(`availableSlots.${index}.day`)}
                                    className="px-3 py-2 rounded-lg border border-slate-200 text-sm outline-none focus:ring-2 focus:ring-sky-500 bg-white capitalize"
                                >
                                    <option value="">Select Day</option>
                                    {DAYS.map((d) => <option key={d} value={d} className="capitalize">{d}</option>)}
                                </select>
                                <input
                                    {...register(`availableSlots.${index}.startTime`)}
                                    type="time"
                                    className="px-3 py-2 rounded-lg border border-slate-200 text-sm outline-none focus:ring-2 focus:ring-sky-500 bg-white"
                                />
                                <input
                                    {...register(`availableSlots.${index}.endTime`)}
                                    type="time"
                                    className="px-3 py-2 rounded-lg border border-slate-200 text-sm outline-none focus:ring-2 focus:ring-sky-500 bg-white"
                                />
                                <Button
                                    type="button"
                                    variant="danger"
                                    size="sm"
                                    icon={Trash2}
                                    onClick={() => remove(index)}
                                >
                                    Remove
                                </Button>
                            </div>
                        ))}
                    </div>
                </div>

                {/* Actions */}
                <div className="flex items-center gap-3 justify-end">
                    <Button variant="outline" onClick={() => navigate("/doctors")}>Cancel</Button>
                    <Button type="submit" variant="primary" loading={loading}>Add Doctor</Button>
                </div>

            </form>
        </div>
    );
};

export default AddDoctor;