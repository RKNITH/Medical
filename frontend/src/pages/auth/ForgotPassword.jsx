import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Link } from "react-router-dom";
import { HeartPulse, Mail, ArrowLeft, CheckCircle, Shield } from "lucide-react";
import api from "../../api/axios.js";

const schema = z.object({
    email: z.string().email("Enter a valid email address."),
});

const ForgotPassword = () => {
    const [loading, setLoading] = useState(false);
    const [success, setSuccess] = useState(false);
    const [error, setError] = useState(null);

    const { register, handleSubmit, formState: { errors } } = useForm({ resolver: zodResolver(schema) });

    const onSubmit = async (data) => {
        setLoading(true);
        setError(null);
        try {
            await api.post("/auth/forgot-password", data);
            setSuccess(true);
        } catch (err) {
            setError(err.response?.data?.message || "Something went wrong. Try again.");
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="min-h-screen flex">
            {/* Left panel */}
            <div className="hidden lg:flex flex-col justify-between w-[45%] p-10 text-white relative overflow-hidden"
                style={{ background: "linear-gradient(150deg, #0a3a54 0%, #0e6396 55%, #0891b2 100%)" }}>
                <div className="absolute inset-0 pointer-events-none">
                    <div className="absolute top-0 right-0 w-96 h-96 rounded-full opacity-10"
                        style={{ background: "radial-gradient(circle, white, transparent 70%)" }} />
                    <div className="absolute bottom-0 left-0 w-72 h-72 rounded-full opacity-10"
                        style={{ background: "radial-gradient(circle, white, transparent 70%)" }} />
                </div>
                <div className="relative flex items-center gap-3">
                    <div className="w-10 h-10 rounded-xl bg-white/20 flex items-center justify-center">
                        <HeartPulse size={22} className="text-white" />
                    </div>
                    <div>
                        <span className="text-2xl font-black">Medi</span><span className="text-2xl font-black text-sky-300">Core</span>
                    </div>
                </div>
                <div className="relative space-y-4">
                    <div className="w-16 h-16 rounded-2xl bg-white/15 flex items-center justify-center mb-6">
                        <Mail size={30} className="text-sky-200" />
                    </div>
                    <h2 className="text-3xl font-bold leading-tight" style={{ fontFamily: "'Merriweather', Georgia, serif" }}>
                        Account Recovery
                    </h2>
                    <p className="text-sky-100 text-[15px] leading-relaxed">
                        We'll send a secure password reset link to your registered email. The link expires in 10 minutes.
                    </p>
                </div>
                <div className="relative flex items-center gap-2 text-sky-300 text-xs">
                    <Shield size={14} />
                    <span>HIPAA compliant · 256-bit encrypted · ISO 27001 certified</span>
                </div>
            </div>

            {/* Right panel */}
            <div className="flex-1 flex flex-col items-center justify-center p-6 bg-slate-50">
                <div className="w-full max-w-md">
                    {/* Mobile logo */}
                    <div className="flex flex-col items-center mb-8 lg:hidden">
                        <div className="w-14 h-14 rounded-2xl flex items-center justify-center shadow-lg mb-3"
                            style={{ background: "linear-gradient(135deg, #0e6396, #0891b2)" }}>
                            <HeartPulse size={28} className="text-white" />
                        </div>
                        <h1 className="text-2xl font-black text-slate-800">MediCore HMS</h1>
                    </div>

                    <div className="bg-white rounded-2xl shadow-sm border border-slate-100 p-8">
                        {success ? (
                            <div className="flex flex-col items-center text-center py-4">
                                <div className="w-16 h-16 rounded-full bg-emerald-100 flex items-center justify-center mb-4">
                                    <CheckCircle size={32} className="text-emerald-500" />
                                </div>
                                <h2 className="text-xl font-bold text-slate-800 mb-2">Check your email</h2>
                                <p className="text-slate-500 text-sm mb-1">We've sent a password reset link.</p>
                                <p className="text-slate-400 text-xs mb-6">Link expires in 10 minutes. Check spam if not received.</p>
                                <Link to="/login"
                                    className="w-full py-3 rounded-xl font-semibold text-white text-sm text-center transition-all hover:opacity-90"
                                    style={{ background: "linear-gradient(135deg, #0e6396, #0891b2)", display: "block" }}>
                                    Back to Login
                                </Link>
                            </div>
                        ) : (
                            <>
                                <h2 className="text-2xl font-bold text-slate-800 mb-1">Forgot Password?</h2>
                                <p className="text-slate-500 text-sm mb-7">Enter your registered email and we'll send a reset link.</p>

                                {error && (
                                    <div className="mb-5 px-4 py-3 bg-red-50 border border-red-200 rounded-xl text-red-600 text-sm">
                                        {error}
                                    </div>
                                )}

                                <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">
                                    <div>
                                        <label className="block text-sm font-semibold text-slate-700 mb-2">Email Address</label>
                                        <div className="relative">
                                            <Mail size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
                                            <input
                                                {...register("email")}
                                                type="email"
                                                placeholder="you@hospital.com"
                                                className={`w-full pl-10 pr-4 py-3 rounded-xl border text-sm text-slate-800 outline-none transition-all
                                                    focus:ring-2 focus:border-transparent
                                                    ${errors.email ? "border-red-300 bg-red-50 focus:ring-red-200" : "border-slate-200 bg-slate-50 focus:ring-sky-200 focus:border-sky-400"}`}
                                            />
                                        </div>
                                        {errors.email && <p className="text-xs text-red-500 mt-1.5">{errors.email.message}</p>}
                                    </div>

                                    <button type="submit" disabled={loading}
                                        className="w-full py-3 rounded-xl font-semibold text-white text-sm transition-all hover:opacity-90 active:scale-[.98] disabled:opacity-60 flex items-center justify-center gap-2"
                                        style={{ background: "linear-gradient(135deg, #0e6396, #0891b2)", boxShadow: "0 4px 14px rgba(14,99,150,.35)" }}>
                                        {loading ? (
                                            <><div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" /> Sending…</>
                                        ) : "Send Reset Link"}
                                    </button>
                                </form>

                                <div className="mt-6 text-center">
                                    <Link to="/login" className="inline-flex items-center gap-1.5 text-sm text-slate-400 hover:text-sky-600 transition-colors">
                                        <ArrowLeft size={14} /> Back to Login
                                    </Link>
                                </div>
                            </>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
};

export default ForgotPassword;
