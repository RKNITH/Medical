import { useState } from "react";
import { NavLink } from "react-router-dom";
import { useSelector } from "react-redux";
import {
    LayoutDashboard, Users, UserRound, CalendarDays,
    FlaskConical, Pill, Receipt, BedDouble,
    FileText, ChevronLeft, ChevronRight,
    HeartPulse, X,
} from "lucide-react";
import { SIDEBAR_LINKS } from "../../utils/roleAccess.js";

const ALL_LINKS = [
    { key: "dashboard", label: "Dashboard", path: "/dashboard", icon: LayoutDashboard },
    { key: "patients", label: "Patients", path: "/patients", icon: UserRound },
    { key: "doctors", label: "Doctors", path: "/doctors", icon: Users },
    { key: "appointments", label: "Appointments", path: "/appointments", icon: CalendarDays },
    { key: "prescriptions", label: "Prescriptions", path: "/prescriptions", icon: FileText },
    { key: "lab", label: "Laboratory", path: "/lab", icon: FlaskConical },
    { key: "pharmacy", label: "Pharmacy", path: "/pharmacy", icon: Pill },
    { key: "billing", label: "Billing", path: "/billing", icon: Receipt },
    { key: "beds", label: "Bed Management", path: "/beds", icon: BedDouble },
    { key: "users", label: "Users", path: "/users", icon: Users },
];

const ROLE_LABELS = {
    super_admin: "Super Admin",
    admin: "Administrator",
    doctor: "Doctor",
    nurse: "Nurse",
    receptionist: "Receptionist",
    lab_technician: "Lab Technician",
    pharmacist: "Pharmacist",
    patient: "Patient",
};

const SidebarContent = ({ collapsed, onCollapse, onClose, isMobile }) => {
    const { user } = useSelector((state) => state.auth);
    const allowedKeys = SIDEBAR_LINKS[user?.role] || [];
    const visibleLinks = ALL_LINKS.filter((link) => allowedKeys.includes(link.key));

    return (
        <div className="flex flex-col h-full text-white"
            style={{ background: "linear-gradient(180deg, #0a3a54 0%, #0c4a67 100%)" }}>

            {/* Logo */}
            <div className={`flex items-center gap-3 px-4 py-5 shrink-0
                ${collapsed && !isMobile ? "justify-center border-b border-white/10" : "justify-between border-b border-white/10"}`}>
                <div className="flex items-center gap-3 min-w-0">
                    <div className="w-8 h-8 rounded-lg flex items-center justify-center shrink-0"
                        style={{ background: "linear-gradient(135deg, #0e6396, #0891b2)" }}>
                        <HeartPulse size={17} className="text-white" />
                    </div>
                    {(!collapsed || isMobile) && (
                        <div className="min-w-0">
                            <div className="flex items-baseline gap-0.5">
                                <span className="text-base font-black text-white">Medi</span>
                                <span className="text-base font-black text-sky-400">Core</span>
                            </div>
                            <p className="text-[9px] font-semibold tracking-widest uppercase text-white/40 -mt-0.5">
                                Hospital & Research
                            </p>
                        </div>
                    )}
                </div>
                {isMobile && (
                    <button
                        onClick={onClose}
                        className="p-1.5 rounded-lg hover:bg-white/10 text-white/60 hover:text-white transition-colors shrink-0"
                    >
                        <X size={18} />
                    </button>
                )}
            </div>

            {/* Role badge */}
            {(!collapsed || isMobile) && user && (
                <div className="mx-3 mt-3 mb-1 px-3 py-2 rounded-lg" style={{ background: "rgba(255,255,255,0.06)" }}>
                    <p className="text-[10px] font-bold uppercase tracking-widest text-white/40">Logged in as</p>
                    <p className="text-xs font-semibold text-sky-300 mt-0.5">{ROLE_LABELS[user.role] || user.role}</p>
                </div>
            )}

            {/* Nav Links */}
            <nav className="flex-1 overflow-y-auto py-3 px-2 space-y-0.5">
                {visibleLinks.map(({ key, label, path, icon: Icon }) => (
                    <NavLink
                        key={key}
                        to={path}
                        className={({ isActive }) =>
                            `flex items-center gap-3 px-3 py-2.5 rounded-xl text-[13px] font-semibold transition-all duration-150
                            ${isActive
                                ? "bg-white/15 text-white shadow-sm"
                                : "text-white/55 hover:bg-white/08 hover:text-white/90"
                            }
                            ${collapsed && !isMobile ? "justify-center" : ""}
                            `
                        }
                        title={collapsed && !isMobile ? label : ""}
                    >
                        {({ isActive }) => (
                            <>
                                <Icon size={17} className={`shrink-0 ${isActive ? "text-sky-300" : ""}`} />
                                {(!collapsed || isMobile) && (
                                    <span className="truncate">{label}</span>
                                )}
                                {(!collapsed || isMobile) && isActive && (
                                    <span className="ml-auto w-1.5 h-1.5 rounded-full bg-sky-400 shrink-0" />
                                )}
                            </>
                        )}
                    </NavLink>
                ))}
            </nav>

            {/* Collapse Toggle — desktop only */}
            {!isMobile && (
                <div className="p-3 border-t border-white/10 shrink-0">
                    <button
                        onClick={onCollapse}
                        className={`w-full flex items-center gap-2 px-3 py-2 rounded-xl
                            text-white/40 hover:bg-white/08 hover:text-white/80
                            transition-colors text-xs font-semibold
                            ${collapsed ? "justify-center" : ""}`}
                    >
                        {collapsed
                            ? <ChevronRight size={16} />
                            : <><ChevronLeft size={16} /><span>Collapse</span></>
                        }
                    </button>
                </div>
            )}
        </div>
    );
};

const Sidebar = ({ mobileOpen, onMobileClose }) => {
    const [collapsed, setCollapsed] = useState(false);

    return (
        <>
            {/* Desktop Sidebar */}
            <aside
                className={`hidden md:flex flex-col shrink-0 transition-all duration-300
                    ${collapsed ? "w-16" : "w-60"}`}
            >
                <SidebarContent
                    collapsed={collapsed}
                    onCollapse={() => setCollapsed(!collapsed)}
                    isMobile={false}
                />
            </aside>

            {/* Mobile Sidebar */}
            <aside
                className={`fixed top-0 left-0 h-full w-64 z-50 flex flex-col
                    transition-transform duration-300 md:hidden
                    ${mobileOpen ? "translate-x-0" : "-translate-x-full"}`}
            >
                <SidebarContent
                    collapsed={false}
                    onClose={onMobileClose}
                    isMobile={true}
                />
            </aside>
        </>
    );
};

export default Sidebar;
