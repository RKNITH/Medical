import { useEffect } from "react";
import { useNavigate, Link } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { loginUser, clearError } from "../../store/slices/authSlice.js";
import { HeartPulse, Mail, Lock, Eye, EyeOff, Shield } from "lucide-react";
import { useState } from "react";
import Button from "../../components/common/Button.jsx";

const schema = z.object({
    email: z.string().email("Enter a valid email address."),
    password: z.string().min(6, "Password must be at least 6 characters."),
});

const Login = () => {
    const dispatch = useDispatch();
    const navigate = useNavigate();
    const { loading, error, user } = useSelector((state) => state.auth);
    const [showPassword, setShowPassword] = useState(false);

    const {
        register,
        handleSubmit,
        formState: { errors },
    } = useForm({ resolver: zodResolver(schema) });

    useEffect(() => {
        if (user) navigate("/dashboard");
        return () => dispatch(clearError());
    }, [user]); // eslint-disable-line

    const onSubmit = (data) => {
        dispatch(loginUser(data));
    };

    return (
        <div className="min-h-screen flex">
            {/* Left panel - branding */}
            <div className="hidden lg:flex flex-col justify-between w-[45%] p-10 text-white relative overflow-hidden"
                style={{ background: "linear-gradient(150deg, #0a3a54 0%, #0e6396 55%, #0891b2 100%)" }}>

                {/* Background decoration */}
                <div className="absolute inset-0 pointer-events-none">
                    <div className="absolute top-0 right-0 w-96 h-96 rounded-full opacity-10"
                        style={{ background: "radial-gradient(circle, white, transparent 70%)" }} />
                    <div className="absolute bottom-0 left-0 w-72 h-72 rounded-full opacity-10"
                        style={{ background: "radial-gradient(circle, white, transparent 70%)" }} />
                    {/* Grid pattern */}
                    <div className="absolute inset-0 opacity-5"
                        style={{
                            backgroundImage: "linear-gradient(rgba(255,255,255,.3) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,.3) 1px, transparent 1px)",
                            backgroundSize: "40px 40px"
                        }} />
                </div>

                <div className="relative">
                    <div className="flex items-center gap-3 mb-2">
                        <div className="w-10 h-10 rounded-xl bg-white/20 flex items-center justify-center">
                            <HeartPulse size={22} className="text-white" />
                        </div>
                        <div>
                            <span className="text-2xl font-black">Medi</span><span className="text-2xl font-black text-sky-300">Core</span>
                        </div>
                    </div>
                    <p className="text-sm text-sky-200 font-medium tracking-wider uppercase">Hospital Management System</p>
                </div>

                <div className="relative space-y-8">
                    <div>
                        <h2 className="text-4xl font-bold leading-tight mb-4" style={{ fontFamily: "'Merriweather', Georgia, serif" }}>
                            Compassionate Care,<br />
                            <span className="text-sky-300">Powered by Technology</span>
                        </h2>
                        <p className="text-sky-100 text-[15px] leading-relaxed">
                            Streamlining healthcare operations for doctors, nurses, administrators and patients — all in one secure platform.
                        </p>
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                        {[
                            { v: "25+", l: "Years of Excellence" },
                            { v: "150+", l: "Specialist Doctors" },
                            { v: "80K+", l: "Patients Served" },
                            { v: "99.9%", l: "System Uptime" },
                        ].map(({ v, l }) => (
                            <div key={l} className="bg-white/10 rounded-xl p-4 backdrop-blur-sm">
                                <p className="text-2xl font-black text-white">{v}</p>
                                <p className="text-sky-200 text-xs mt-0.5">{l}</p>
                            </div>
                        ))}
                    </div>
                </div>

                <div className="relative flex items-center gap-2 text-sky-300 text-xs">
                    <Shield size={14} />
                    <span>HIPAA compliant · 256-bit encrypted · ISO 27001 certified</span>
                </div>
            </div>

            {/* Right panel - login form */}
            <div className="flex-1 flex flex-col items-center justify-center p-6 bg-slate-50">
                <div className="w-full max-w-md">

                    {/* Mobile logo */}
                    <div className="flex flex-col items-center mb-8 lg:hidden">
                        <div className="w-14 h-14 rounded-2xl flex items-center justify-center shadow-lg mb-3"
                            style={{ background: "linear-gradient(135deg, #0e6396, #0891b2)" }}>
                            <HeartPulse size={28} className="text-white" />
                        </div>
                        <h1 className="text-2xl font-black text-slate-800">MediCore HMS</h1>
                        <p className="text-slate-400 text-sm mt-1">Hospital Management System</p>
                    </div>

                    <div className="bg-white rounded-2xl shadow-sm border border-slate-100 p-8">
                        <h2 className="text-2xl font-bold text-slate-800 mb-1">Welcome back</h2>
                        <p className="text-slate-500 text-sm mb-7">Sign in to your MediCore account to continue</p>

                        {error && (
                            <div className="mb-5 px-4 py-3 bg-red-50 border border-red-200 rounded-xl text-red-600 text-sm flex items-center gap-2">
                                <span className="w-1.5 h-1.5 rounded-full bg-red-500 shrink-0" />
                                {error}
                            </div>
                        )}

                        <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">
                            <div>
                                <label className="block text-sm font-semibold text-slate-700 mb-2">
                                    Email Address
                                </label>
                                <div className="relative">
                                    <Mail size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
                                    <input
                                        {...register("email")}
                                        type="email"
                                        placeholder="you@hospital.com"
                                        className={`w-full pl-10 pr-4 py-3 rounded-xl border text-sm text-slate-800 outline-none transition-all
                                            focus:ring-2 focus:border-transparent
                                            ${errors.email
                                                ? "border-red-300 bg-red-50 focus:ring-red-200"
                                                : "border-slate-200 bg-slate-50 focus:ring-sky-200 focus:border-sky-400"}`}
                                    />
                                </div>
                                {errors.email && (
                                    <p className="text-xs text-red-500 mt-1.5 flex items-center gap-1">
                                        <span className="w-1 h-1 rounded-full bg-red-400 shrink-0" />
                                        {errors.email.message}
                                    </p>
                                )}
                            </div>

                            <div>
                                <div className="flex items-center justify-between mb-2">
                                    <label className="block text-sm font-semibold text-slate-700">Password</label>
                                    <Link to="/forgot-password"
                                        className="text-xs font-medium text-sky-600 hover:text-sky-700 hover:underline transition-colors">
                                        Forgot password?
                                    </Link>
                                </div>
                                <div className="relative">
                                    <Lock size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
                                    <input
                                        {...register("password")}
                                        type={showPassword ? "text" : "password"}
                                        placeholder="••••••••"
                                        className={`w-full pl-10 pr-11 py-3 rounded-xl border text-sm text-slate-800 outline-none transition-all
                                            focus:ring-2 focus:border-transparent
                                            ${errors.password
                                                ? "border-red-300 bg-red-50 focus:ring-red-200"
                                                : "border-slate-200 bg-slate-50 focus:ring-sky-200 focus:border-sky-400"}`}
                                    />
                                    <button
                                        type="button"
                                        onClick={() => setShowPassword(!showPassword)}
                                        className="absolute right-3.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 transition-colors"
                                    >
                                        {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                                    </button>
                                </div>
                                {errors.password && (
                                    <p className="text-xs text-red-500 mt-1.5 flex items-center gap-1">
                                        <span className="w-1 h-1 rounded-full bg-red-400 shrink-0" />
                                        {errors.password.message}
                                    </p>
                                )}
                            </div>

                            <button
                                type="submit"
                                disabled={loading}
                                className="w-full py-3 rounded-xl font-semibold text-white text-sm transition-all hover:opacity-90 active:scale-[.98] disabled:opacity-60 flex items-center justify-center gap-2"
                                style={{ background: "linear-gradient(135deg, #0e6396, #0891b2)", boxShadow: "0 4px 14px rgba(14,99,150,.35)" }}
                            >
                                {loading ? (
                                    <>
                                        <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                                        Signing in…
                                    </>
                                ) : "Sign In"}
                            </button>
                        </form>
                    </div>

                    <div className="flex items-center justify-between mt-5 text-xs text-slate-400">
                        <span>© {new Date().getFullYear()} MediCore Hospital & Research Centre</span>
                        <Link to="/" className="hover:text-slate-600 transition-colors">← Back to Home</Link>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default Login;
