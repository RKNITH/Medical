import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Link, useParams, useNavigate } from "react-router-dom";
import { Hospital, Lock, Eye, EyeOff, CheckCircle, AlertCircle } from "lucide-react";
import api from "../../api/axios.js";
import Button from "../../components/common/Button.jsx";

const schema = z
    .object({
        password: z.string().min(6, "Password must be at least 6 characters."),
        confirmPassword: z.string().min(6, "Please confirm your password."),
    })
    .refine((d) => d.password === d.confirmPassword, {
        message: "Passwords do not match.",
        path: ["confirmPassword"],
    });

const ResetPassword = () => {
    const { token } = useParams();
    const navigate = useNavigate();
    const [loading, setLoading] = useState(false);
    const [success, setSuccess] = useState(false);
    const [error, setError] = useState(null);
    const [showPw, setShowPw] = useState(false);
    const [showCpw, setShowCpw] = useState(false);

    const {
        register,
        handleSubmit,
        formState: { errors },
    } = useForm({ resolver: zodResolver(schema) });

    const onSubmit = async (data) => {
        setLoading(true);
        setError(null);
        try {
            await api.post(`/auth/reset-password/${token}`, { password: data.password });
            setSuccess(true);
            setTimeout(() => navigate("/login"), 3000);
        } catch (err) {
            setError(err.response?.data?.message || "Invalid or expired reset link. Please try again.");
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-sky-900 flex items-center justify-center p-4">
            <div className="w-full max-w-md">
                {/* Logo */}
                <div className="flex flex-col items-center mb-8">
                    <div className="w-14 h-14 bg-sky-500 rounded-2xl flex items-center justify-center shadow-lg mb-4">
                        <Hospital size={28} className="text-white" />
                    </div>
                    <h1 className="text-3xl font-bold text-white tracking-tight">MediCore</h1>
                    <p className="text-slate-400 text-sm mt-1">Hospital Management System</p>
                </div>

                <div className="bg-white rounded-2xl shadow-2xl p-8">
                    {success ? (
                        <div className="flex flex-col items-center text-center py-4">
                            <CheckCircle size={48} className="text-emerald-500 mb-4" />
                            <h2 className="text-xl font-semibold text-slate-800 mb-2">Password Reset!</h2>
                            <p className="text-slate-500 text-sm mb-2">
                                Your password has been successfully updated.
                            </p>
                            <p className="text-slate-400 text-xs mb-6">Redirecting to login…</p>
                            <Link to="/login">
                                <Button variant="primary">Go to Login</Button>
                            </Link>
                        </div>
                    ) : (
                        <>
                            <h2 className="text-xl font-semibold text-slate-800 mb-1">Set New Password</h2>
                            <p className="text-slate-500 text-sm mb-6">
                                Enter a new secure password for your account.
                            </p>

                            {error && (
                                <div className="mb-4 flex items-start gap-2 px-4 py-3 bg-red-50 border border-red-200 rounded-lg text-red-600 text-sm">
                                    <AlertCircle size={16} className="shrink-0 mt-0.5" />
                                    {error}
                                </div>
                            )}

                            <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">
                                {/* New Password */}
                                <div>
                                    <label className="block text-sm font-medium text-slate-700 mb-1.5">
                                        New Password
                                    </label>
                                    <div className="relative">
                                        <Lock size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
                                        <input
                                            {...register("password")}
                                            type={showPw ? "text" : "password"}
                                            placeholder="At least 6 characters"
                                            className={`w-full pl-9 pr-10 py-2.5 rounded-lg border text-sm text-slate-800 outline-none transition-all
                        focus:ring-2 focus:ring-sky-500 focus:border-sky-500
                        ${errors.password ? "border-red-400 bg-red-50" : "border-slate-300 bg-slate-50"}`}
                                        />
                                        <button
                                            type="button"
                                            onClick={() => setShowPw(!showPw)}
                                            className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600"
                                        >
                                            {showPw ? <EyeOff size={16} /> : <Eye size={16} />}
                                        </button>
                                    </div>
                                    {errors.password && (
                                        <p className="text-xs text-red-500 mt-1">{errors.password.message}</p>
                                    )}
                                </div>

                                {/* Confirm Password */}
                                <div>
                                    <label className="block text-sm font-medium text-slate-700 mb-1.5">
                                        Confirm Password
                                    </label>
                                    <div className="relative">
                                        <Lock size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
                                        <input
                                            {...register("confirmPassword")}
                                            type={showCpw ? "text" : "password"}
                                            placeholder="Repeat your new password"
                                            className={`w-full pl-9 pr-10 py-2.5 rounded-lg border text-sm text-slate-800 outline-none transition-all
                        focus:ring-2 focus:ring-sky-500 focus:border-sky-500
                        ${errors.confirmPassword ? "border-red-400 bg-red-50" : "border-slate-300 bg-slate-50"}`}
                                        />
                                        <button
                                            type="button"
                                            onClick={() => setShowCpw(!showCpw)}
                                            className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600"
                                        >
                                            {showCpw ? <EyeOff size={16} /> : <Eye size={16} />}
                                        </button>
                                    </div>
                                    {errors.confirmPassword && (
                                        <p className="text-xs text-red-500 mt-1">{errors.confirmPassword.message}</p>
                                    )}
                                </div>

                                <Button
                                    type="submit"
                                    variant="primary"
                                    size="lg"
                                    loading={loading}
                                    className="w-full"
                                >
                                    Reset Password
                                </Button>
                            </form>

                            <div className="mt-6 text-center">
                                <Link
                                    to="/login"
                                    className="text-sm text-slate-400 hover:text-sky-500 transition-colors"
                                >
                                    Back to Login
                                </Link>
                            </div>
                        </>
                    )}
                </div>
            </div>
        </div>
    );
};

export default ResetPassword;
