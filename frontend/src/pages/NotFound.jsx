import { useNavigate } from "react-router-dom";
import { HeartPulse, Home, ArrowLeft } from "lucide-react";

const NotFound = () => {
    const navigate = useNavigate();
    return (
        <div className="min-h-screen flex flex-col items-center justify-center p-6 bg-slate-50">
            <div className="text-center max-w-md">
                <div className="w-20 h-20 rounded-2xl flex items-center justify-center mx-auto mb-6 shadow-lg"
                    style={{ background: "linear-gradient(135deg,#0e6396,#0891b2)" }}>
                    <HeartPulse size={36} className="text-white" />
                </div>
                <h1 className="text-8xl font-black text-slate-100 mb-2 leading-none">404</h1>
                <h2 className="text-2xl font-bold text-slate-700 mb-3">Page Not Found</h2>
                <p className="text-slate-400 text-sm mb-8 leading-relaxed">
                    The page you're looking for doesn't exist or has been moved.<br />
                    Please check the URL or return to the dashboard.
                </p>
                <div className="flex flex-col sm:flex-row gap-3 justify-center">
                    <button
                        onClick={() => navigate(-1)}
                        className="flex items-center justify-center gap-2 px-5 py-2.5 rounded-xl border border-slate-200 text-slate-600 hover:bg-slate-100 text-sm font-semibold transition-colors"
                    >
                        <ArrowLeft size={15} /> Go Back
                    </button>
                    <button
                        onClick={() => navigate("/dashboard")}
                        className="flex items-center justify-center gap-2 px-5 py-2.5 rounded-xl text-white text-sm font-semibold transition-all hover:opacity-90"
                        style={{ background: "linear-gradient(135deg,#0e6396,#0891b2)" }}
                    >
                        <Home size={15} /> Dashboard
                    </button>
                </div>
                <p className="mt-8 text-xs text-slate-300">MediCore Hospital Management System</p>
            </div>
        </div>
    );
};

export default NotFound;
