import { useState, useRef } from "react";
import { useDispatch, useSelector } from "react-redux";
import { Bell, LogOut, User, ChevronDown, Menu, Camera } from "lucide-react";
import { logoutUser } from "../../store/slices/authSlice.js";
import { markAllAsRead } from "../../store/slices/notificationSlice.js";
import { useNavigate } from "react-router-dom";
import api from "../../api/axios.js";

const ROLE_LABELS = {
    super_admin: "Super Administrator",
    admin: "Administrator",
    doctor: "Doctor",
    nurse: "Nurse",
    receptionist: "Receptionist",
    lab_technician: "Lab Technician",
    pharmacist: "Pharmacist",
    patient: "Patient",
};

const Navbar = ({ onMenuClick }) => {
    const dispatch = useDispatch();
    const navigate = useNavigate();
    const { user } = useSelector((state) => state.auth);
    const { list: notifications } = useSelector((state) => state.notifications);

    const [showNotifications, setShowNotifications] = useState(false);
    const [showProfile, setShowProfile] = useState(false);
    const [uploadingAvatar, setUploadingAvatar] = useState(false);
    const fileInputRef = useRef(null);

    const unreadCount = notifications.filter((n) => !n.read).length;
    const hasProfile = ["doctor", "patient"].includes(user?.role);

    const handleLogout = async () => {
        closeAll();
        await dispatch(logoutUser());
        navigate("/login");
    };

    const closeAll = () => {
        setShowNotifications(false);
        setShowProfile(false);
    };

    const handleAvatarUpload = async (e) => {
        const file = e.target.files?.[0];
        if (!file) return;
        setUploadingAvatar(true);
        try {
            const formData = new FormData();
            formData.append("avatar", file);
            await api.put("/users/avatar", formData, {
                headers: { "Content-Type": "multipart/form-data" },
            });
            window.location.reload();
        } catch (err) {
            console.error("Avatar upload failed:", err);
        } finally {
            setUploadingAvatar(false);
        }
    };

    const notifColor = (type) => {
        if (type === "success") return "border-l-2 border-emerald-400 bg-emerald-50/50";
        if (type === "error") return "border-l-2 border-red-400 bg-red-50/50";
        return "border-l-2 border-sky-400 bg-sky-50/50";
    };

    return (
        /* Sticky within the flex column — no z-index fight with sidebar */
        <header className="h-16 bg-white border-b border-slate-200 flex items-center justify-between px-4 md:px-6 shrink-0 sticky top-0 z-30 shadow-sm">

            {/* Left — Mobile Menu + Welcome */}
            <div className="flex items-center gap-3">
                <button
                    className="md:hidden p-2 rounded-xl hover:bg-slate-100 text-slate-600 transition-colors"
                    onClick={onMenuClick}
                    aria-label="Open menu"
                >
                    <Menu size={20} />
                </button>

                <div className="hidden sm:block">
                    <p className="text-sm font-semibold text-slate-800 leading-tight">
                        {user?.name}
                    </p>
                    <p className="text-xs text-slate-400 capitalize leading-tight">
                        {ROLE_LABELS[user?.role] || user?.role}
                    </p>
                </div>
            </div>

            {/* Right */}
            <div className="flex items-center gap-1">

                {/* Notification Bell */}
                <div className="relative">
                    <button
                        onClick={() => {
                            setShowNotifications(!showNotifications);
                            setShowProfile(false);
                            if (!showNotifications) dispatch(markAllAsRead());
                        }}
                        className="relative p-2 rounded-xl hover:bg-slate-100 text-slate-500 hover:text-slate-700 transition-colors"
                        aria-label="Notifications"
                    >
                        <Bell size={19} />
                        {unreadCount > 0 && (
                            <span className="absolute top-1 right-1 w-4 h-4 text-white text-[9px] font-bold rounded-full flex items-center justify-center"
                                style={{ background: "#e11d48" }}>
                                {unreadCount > 9 ? "9+" : unreadCount}
                            </span>
                        )}
                    </button>

                    {showNotifications && (
                        <>
                            <div className="fixed inset-0 z-40" onClick={closeAll} />
                            <div className="absolute right-0 top-11 w-80 bg-white rounded-2xl shadow-xl border border-slate-100 z-50 overflow-hidden">
                                <div className="px-4 py-3 border-b border-slate-100 flex items-center justify-between">
                                    <p className="font-semibold text-slate-800 text-sm">Notifications</p>
                                    {notifications.length > 0 && (
                                        <span className="text-[11px] text-slate-400 bg-slate-100 px-2 py-0.5 rounded-full">
                                            {unreadCount > 0 ? `${unreadCount} new` : "All read"}
                                        </span>
                                    )}
                                </div>
                                <div className="max-h-80 overflow-y-auto divide-y divide-slate-50">
                                    {notifications.length === 0 ? (
                                        <div className="flex flex-col items-center justify-center py-10 gap-2">
                                            <Bell size={24} className="text-slate-200" />
                                            <p className="text-slate-400 text-sm">No notifications yet</p>
                                        </div>
                                    ) : (
                                        notifications.map((n) => (
                                            <div key={n.id}
                                                className={`px-4 py-3 text-sm transition-colors ${!n.read ? notifColor(n.type) : ""}`}>
                                                <p className="text-slate-700 leading-snug text-[13px]">{n.message}</p>
                                                {n.createdAt && (
                                                    <p className="text-xs text-slate-400 mt-1">
                                                        {new Date(n.createdAt).toLocaleTimeString("en-IN", { hour: "2-digit", minute: "2-digit" })}
                                                    </p>
                                                )}
                                            </div>
                                        ))
                                    )}
                                </div>
                            </div>
                        </>
                    )}
                </div>

                {/* Profile Dropdown */}
                <div className="relative">
                    <button
                        onClick={() => { setShowProfile(!showProfile); setShowNotifications(false); }}
                        className="flex items-center gap-2 px-2 py-1.5 rounded-xl hover:bg-slate-100 transition-colors"
                    >
                        <div className="w-8 h-8 rounded-full flex items-center justify-center text-white font-bold text-sm overflow-hidden shrink-0"
                            style={{ background: "linear-gradient(135deg, #0e6396, #0891b2)" }}>
                            {user?.avatar
                                ? <img src={user.avatar} alt={user.name} className="w-full h-full object-cover" />
                                : user?.name?.charAt(0).toUpperCase()
                            }
                        </div>
                        <span className="hidden md:block text-sm font-semibold text-slate-700 max-w-[120px] truncate">
                            {user?.name}
                        </span>
                        <ChevronDown size={14} className="text-slate-400 hidden md:block" />
                    </button>

                    {showProfile && (
                        <>
                            <div className="fixed inset-0 z-40" onClick={closeAll} />
                            <div className="absolute right-0 top-11 w-60 bg-white rounded-2xl shadow-xl border border-slate-100 z-50 overflow-hidden">

                                {/* User info */}
                                <div className="px-4 py-4 border-b border-slate-100"
                                    style={{ background: "linear-gradient(135deg, #f0f8ff, #e8f5fd)" }}>
                                    <div className="flex items-center gap-3">
                                        <div className="relative shrink-0">
                                            <div className="w-11 h-11 rounded-full flex items-center justify-center text-white font-bold overflow-hidden"
                                                style={{ background: "linear-gradient(135deg, #0e6396, #0891b2)" }}>
                                                {user?.avatar
                                                    ? <img src={user.avatar} alt="" className="w-full h-full object-cover" />
                                                    : user?.name?.charAt(0).toUpperCase()
                                                }
                                            </div>
                                            <button
                                                onClick={() => fileInputRef.current?.click()}
                                                disabled={uploadingAvatar}
                                                className="absolute -bottom-0.5 -right-0.5 w-5 h-5 rounded-full flex items-center justify-center hover:scale-110 transition-transform"
                                                style={{ background: "#0e6396" }}
                                                title="Change photo"
                                            >
                                                {uploadingAvatar
                                                    ? <div className="w-2.5 h-2.5 border border-white border-t-transparent rounded-full animate-spin" />
                                                    : <Camera size={10} className="text-white" />
                                                }
                                            </button>
                                            <input ref={fileInputRef} type="file" accept="image/*" className="hidden" onChange={handleAvatarUpload} />
                                        </div>
                                        <div className="min-w-0">
                                            <p className="text-sm font-bold text-slate-800 truncate">{user?.name}</p>
                                            <p className="text-xs text-slate-500 truncate">{user?.email}</p>
                                            <span className="inline-block text-[10px] font-bold px-1.5 py-0.5 rounded-md mt-1 capitalize"
                                                style={{ background: "#dff0fb", color: "#0e6396" }}>
                                                {ROLE_LABELS[user?.role] || user?.role}
                                            </span>
                                        </div>
                                    </div>
                                </div>

                                <div className="py-1">
                                    {hasProfile && (
                                        <button
                                            onClick={() => { navigate("/my-profile"); closeAll(); }}
                                            className="w-full flex items-center gap-2.5 px-4 py-2.5 text-sm text-slate-700 hover:bg-slate-50 transition-colors font-medium"
                                        >
                                            <User size={15} className="text-slate-400" />
                                            My Profile
                                        </button>
                                    )}

                                    <hr className="my-1 border-slate-100" />

                                    <button
                                        onClick={handleLogout}
                                        className="w-full flex items-center gap-2.5 px-4 py-2.5 text-sm font-medium transition-colors"
                                        style={{ color: "#e11d48" }}
                                        onMouseEnter={e => e.currentTarget.style.background = "#fff1f2"}
                                        onMouseLeave={e => e.currentTarget.style.background = ""}
                                    >
                                        <LogOut size={15} />
                                        Sign Out
                                    </button>
                                </div>
                            </div>
                        </>
                    )}
                </div>
            </div>
        </header>
    );
};

export default Navbar;
