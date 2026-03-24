import { useState } from "react";
import { useDispatch } from "react-redux";
import { useNavigate } from "react-router-dom";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { createPatient } from "../../store/slices/patientSlice.js";
import { ArrowLeft } from "lucide-react";
import Button from "../../components/common/Button.jsx";
import { BLOOD_GROUPS, DEPARTMENTS } from "../../utils/constants.js";

const schema = z.object({
    name: z.string().min(2, "Name is required."),
    email: z.string().email("Valid email required."),
    password: z.string().min(6, "Min 6 characters."),
    phone: z.string().min(10, "Valid phone required."),
    age: z.coerce.number().min(1).max(120),
    gender: z.enum(["male", "female", "other"]),
    bloodGroup: z.string().optional(),
    street: z.string().optional(),
    city: z.string().optional(),
    state: z.string().optional(),
    pincode: z.string().optional(),
    emergencyName: z.string().optional(),
    emergencyPhone: z.string().optional(),
    emergencyRelation: z.string().optional(),
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

const AddPatient = () => {
    const dispatch = useDispatch();
    const navigate = useNavigate();
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);

    const { register, handleSubmit, formState: { errors } } = useForm({ resolver: zodResolver(schema) });

    const onSubmit = async (data) => {
        setLoading(true);
        setError(null);
        try {
            const payload = {
                name: data.name,
                email: data.email,
                password: data.password,
                phone: data.phone,
                age: data.age,
                gender: data.gender,
                bloodGroup: data.bloodGroup,
                address: { street: data.street, city: data.city, state: data.state, pincode: data.pincode },
                emergencyContact: { name: data.emergencyName, phone: data.emergencyPhone, relation: data.emergencyRelation },
            };
            await dispatch(createPatient(payload)).unwrap();
            navigate("/patients");
        } catch (err) {
            setError(err);
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="space-y-5 max-w-4xl">

            {/* Header */}
            <div className="flex items-center gap-3">
                <Button variant="ghost" size="sm" icon={ArrowLeft} onClick={() => navigate("/patients")}>
                    Back
                </Button>
                <div>
                    <h1 className="text-2xl font-bold text-slate-800">Register Patient</h1>
                    <p className="text-sm text-slate-500">Fill in the details to register a new patient</p>
                </div>
            </div>

            {error && (
                <div className="px-4 py-3 bg-red-50 border border-red-200 rounded-lg text-red-600 text-sm">
                    {error}
                </div>
            )}

            <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">

                {/* Account Info */}
                <div className="bg-white rounded-2xl border border-slate-100 shadow-sm p-6 space-y-4">
                    <h2 className="text-sm font-semibold text-slate-700 border-b border-slate-100 pb-3">
                        Account Information
                    </h2>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                        <Field label="Full Name" error={errors.name?.message}>
                            <input {...register("name")} placeholder="John Doe" className={inputClass(errors.name)} />
                        </Field>
                        <Field label="Email Address" error={errors.email?.message}>
                            <input {...register("email")} type="email" placeholder="john@example.com" className={inputClass(errors.email)} />
                        </Field>
                        <Field label="Password" error={errors.password?.message}>
                            <input {...register("password")} type="password" placeholder="Min 6 characters" className={inputClass(errors.password)} />
                        </Field>
                        <Field label="Phone Number" error={errors.phone?.message}>
                            <input {...register("phone")} placeholder="+91 9876543210" className={inputClass(errors.phone)} />
                        </Field>
                    </div>
                </div>

                {/* Personal Info */}
                <div className="bg-white rounded-2xl border border-slate-100 shadow-sm p-6 space-y-4">
                    <h2 className="text-sm font-semibold text-slate-700 border-b border-slate-100 pb-3">
                        Personal Information
                    </h2>
                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                        <Field label="Age" error={errors.age?.message}>
                            <input {...register("age")} type="number" placeholder="25" className={inputClass(errors.age)} />
                        </Field>
                        <Field label="Gender" error={errors.gender?.message}>
                            <select {...register("gender")} className={inputClass(errors.gender)}>
                                <option value="">Select gender</option>
                                <option value="male">Male</option>
                                <option value="female">Female</option>
                                <option value="other">Other</option>
                            </select>
                        </Field>
                        <Field label="Blood Group" error={errors.bloodGroup?.message}>
                            <select {...register("bloodGroup")} className={inputClass(errors.bloodGroup)}>
                                <option value="">Select blood group</option>
                                {BLOOD_GROUPS.map((bg) => (
                                    <option key={bg} value={bg}>{bg}</option>
                                ))}
                            </select>
                        </Field>
                    </div>
                </div>

                {/* Address */}
                <div className="bg-white rounded-2xl border border-slate-100 shadow-sm p-6 space-y-4">
                    <h2 className="text-sm font-semibold text-slate-700 border-b border-slate-100 pb-3">
                        Address
                    </h2>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                        <Field label="Street">
                            <input {...register("street")} placeholder="123 Main Street" className={inputClass(false)} />
                        </Field>
                        <Field label="City">
                            <input {...register("city")} placeholder="Mumbai" className={inputClass(false)} />
                        </Field>
                        <Field label="State">
                            <input {...register("state")} placeholder="Maharashtra" className={inputClass(false)} />
                        </Field>
                        <Field label="Pincode">
                            <input {...register("pincode")} placeholder="400001" className={inputClass(false)} />
                        </Field>
                    </div>
                </div>

                {/* Emergency Contact */}
                <div className="bg-white rounded-2xl border border-slate-100 shadow-sm p-6 space-y-4">
                    <h2 className="text-sm font-semibold text-slate-700 border-b border-slate-100 pb-3">
                        Emergency Contact
                    </h2>
                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                        <Field label="Contact Name">
                            <input {...register("emergencyName")} placeholder="Jane Doe" className={inputClass(false)} />
                        </Field>
                        <Field label="Contact Phone">
                            <input {...register("emergencyPhone")} placeholder="+91 9876543210" className={inputClass(false)} />
                        </Field>
                        <Field label="Relation">
                            <input {...register("emergencyRelation")} placeholder="Spouse / Parent" className={inputClass(false)} />
                        </Field>
                    </div>
                </div>

                {/* Actions */}
                <div className="flex items-center gap-3 justify-end">
                    <Button variant="outline" onClick={() => navigate("/patients")}>Cancel</Button>
                    <Button type="submit" variant="primary" loading={loading}>Register Patient</Button>
                </div>

            </form>
        </div>
    );
};

export default AddPatient;