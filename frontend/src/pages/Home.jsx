import { useState, useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";
import { motion, useInView, AnimatePresence } from "framer-motion";
import {
    Phone, Mail, MapPin, Clock, Menu, X, ChevronRight,
    Heart, Brain, Bone, Baby, Eye, Shield, Zap, Scan,
    FlaskConical, Pill, Ambulance, HeartPulse, Stethoscope,
    Calendar, Users, Award, Building2, Star, CheckCircle,
    ArrowRight, ChevronDown, MessageCircle,
    Syringe, BedDouble, Video,
} from "lucide-react";

/* ─── Font & global styles ───────────────────────────────── */
const FontStyle = () => (
    <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Nunito+Sans:ital,opsz,wght@0,6..12,300;0,6..12,400;0,6..12,500;0,6..12,600;0,6..12,700;0,6..12,800;1,6..12,400&family=Merriweather:ital,wght@0,400;0,700;1,400&display=swap');
        *, *::before, *::after { box-sizing: border-box; }
        html { scroll-behavior: smooth; }
        body { margin: 0; }
        .font-display { font-family: 'Merriweather', Georgia, serif !important; }
        .font-body    { font-family: 'Nunito Sans', 'Segoe UI', sans-serif !important; }
        .bg-grid-pattern {
            background-image:
                linear-gradient(rgba(14,99,150,.04) 1px, transparent 1px),
                linear-gradient(90deg, rgba(14,99,150,.04) 1px, transparent 1px);
            background-size: 40px 40px;
        }
        .nav-link-underline::after {
            content:''; display:block; width:0; height:2px;
            background:#0e6396; transition:width .25s ease;
        }
        .nav-link-underline:hover::after { width:100%; }
        .card-lift {
            transition: transform .3s cubic-bezier(.22,1,.36,1), box-shadow .3s ease;
        }
        .card-lift:hover {
            transform: translateY(-6px);
            box-shadow: 0 20px 40px -12px rgba(14,99,150,.18);
        }
        @keyframes ping-slow {
            0%,100%{ opacity:1; transform:scale(1); }
            50%    { opacity:.35; transform:scale(1.45); }
        }
        .ping-anim { animation: ping-slow 2.4s ease-in-out infinite; }
        .grad-text {
            background: linear-gradient(135deg,#0e6396 0%,#0891b2 100%);
            -webkit-background-clip:text; -webkit-text-fill-color:transparent;
            background-clip:text;
        }
    `}</style>
);

/* ─── Animation variants ─────────────────────────────────── */
const FV = { hidden: { opacity: 0, y: 26 }, show: { opacity: 1, y: 0, transition: { duration: .6, ease: [.22, 1, .36, 1] } } };
const LV = { hidden: { opacity: 0, x: -28 }, show: { opacity: 1, x: 0, transition: { duration: .65, ease: [.22, 1, .36, 1] } } };
const RV = { hidden: { opacity: 0, x: 28 }, show: { opacity: 1, x: 0, transition: { duration: .65, ease: [.22, 1, .36, 1] } } };
const ST = { hidden: {}, show: { transition: { staggerChildren: .09 } } };

/* Scroll-triggered stagger wrapper */
const Reveal = ({ id, children, className = "", variants = ST }) => {
    const ref = useRef(null);
    const iv = useInView(ref, { once: true, margin: "-70px" });
    return (
        <motion.div id={id} ref={ref}
            initial="hidden" animate={iv ? "show" : "hidden"} variants={variants}
            className={className}>
            {children}
        </motion.div>
    );
};
/* Single item inside Reveal */
const FU = ({ children, delay = 0, className = "" }) => (
    <motion.div variants={FV} transition={{ delay }} className={className}>{children}</motion.div>
);

/* ─── Data ───────────────────────────────────────────────── */
const DEPTS = [
    { icon: Heart, label: "Cardiology", desc: "Expert heart care & cardiac surgery", color: "#e11d48", bg: "#fff1f2" },
    { icon: Brain, label: "Neurology", desc: "Brain & nervous system specialists", color: "#7c3aed", bg: "#f5f3ff" },
    { icon: Bone, label: "Orthopedics", desc: "Bone, joint & spine excellence", color: "#d97706", bg: "#fffbeb" },
    { icon: Baby, label: "Pediatrics", desc: "Compassionate care for children", color: "#0891b2", bg: "#ecfeff" },
    { icon: Eye, label: "Ophthalmology", desc: "Complete eye & vision care", color: "#059669", bg: "#ecfdf5" },
    { icon: Scan, label: "Radiology", desc: "Advanced imaging & diagnostics", color: "#0e6396", bg: "#eff6ff" },
    { icon: Shield, label: "Oncology", desc: "Cancer diagnosis & therapy", color: "#4f46e5", bg: "#eef2ff" },
    { icon: Zap, label: "Emergency", desc: "24/7 trauma & critical care unit", color: "#ea580c", bg: "#fff7ed" },
];

const SERVICES = [
    { icon: FlaskConical, label: "Diagnostic Lab", desc: "State-of-art lab, 600+ tests" },
    { icon: Pill, label: "24/7 Pharmacy", desc: "In-house dispensary, all brands" },
    { icon: Ambulance, label: "Ambulance Fleet", desc: "GPS-equipped, city-wide coverage" },
    { icon: HeartPulse, label: "ICU & Critical Care", desc: "Ventilator support, 24 hr monitoring" },
    { icon: Stethoscope, label: "Health Packages", desc: "Preventive & full-body checkups" },
    { icon: Video, label: "Telemedicine", desc: "Video consult from anywhere" },
    { icon: Syringe, label: "Vaccination", desc: "Child & adult immunisation centre" },
    { icon: BedDouble, label: "Private Rooms", desc: "Deluxe, semi-deluxe & general wards" },
];

const DOCTORS = [
    { name: "Dr. Arjun Sharma", spec: "Senior Cardiologist", exp: "18 yrs", init: "AS", bg: "#fde8ec", fg: "#e11d48" },
    { name: "Dr. Priya Nair", spec: "Consultant Neurologist", exp: "14 yrs", init: "PN", bg: "#ede9fe", fg: "#7c3aed" },
    { name: "Dr. Rohan Mehta", spec: "Orthopedic Surgeon", exp: "12 yrs", init: "RM", bg: "#fef3c7", fg: "#d97706" },
    { name: "Dr. Sunita Verma", spec: "Paediatric Specialist", exp: "16 yrs", init: "SV", bg: "#cffafe", fg: "#0891b2" },
];

const PACKAGES = [
    { name: "Basic Wellness", price: "₹799", tests: ["CBC", "Blood Sugar", "Urine Routine", "ECG"], color: "#e0f2fe", accent: "#0891b2" },
    { name: "Heart Care", price: "₹1,999", tests: ["Lipid Profile", "TMT", "Echo", "Chest X-Ray", "HbA1c"], color: "#fde8ec", accent: "#e11d48", popular: true },
    { name: "Diabetes Screen", price: "₹1,299", tests: ["FBS", "PPBS", "HbA1c", "Kidney Panel", "Urine Micro"], color: "#fef3c7", accent: "#d97706" },
    { name: "Full Body", price: "₹3,499", tests: ["80+ Parameters", "Thyroid", "Liver", "Kidney", "Vitamins"], color: "#ecfdf5", accent: "#059669" },
];

const TESTIMONIALS = [
    { name: "Kavitha Reddy", tx: "Cardiac Surgery", rating: 5, text: "Absolutely world-class care. The cardiac team was thorough, reassuring and available at every step. I couldn't have asked for better treatment." },
    { name: "Rajesh Kumar", tx: "Orthopedic Surgery", rating: 5, text: "My knee replacement at MediCore was seamless — minimal pain, speedy recovery and a support team genuinely invested in my wellbeing." },
    { name: "Meena Iyer", tx: "Paediatric Care", rating: 5, text: "The paediatric department made my daughter feel completely at ease. Brilliant doctors and a nursing staff full of patience and compassion." },
];

const FAQS = [
    { q: "Do you provide 24/7 emergency services?", a: "Yes. Our Emergency & Trauma Centre runs 24/7/365 with a dedicated team of emergency physicians, surgeons and nurses." },
    { q: "How do I book an appointment?", a: "Book online via the patient portal, call +91 98765 43210, or simply walk in at our reception desk." },
    { q: "Are cashless insurance claims accepted?", a: "We partner with 25+ insurers including Star Health, ICICI Lombard, HDFC Ergo and LIC for fully cashless treatments." },
    { q: "What are visiting hours for admitted patients?", a: "General ward: 10 AM – 12 PM & 5 PM – 7 PM. ICU visits are restricted and require permission from the duty nurse." },
    { q: "Is telemedicine / video consultation available?", a: "Yes — book a video consult with any specialist through our patient portal, Mon–Sat 9 AM – 6 PM." },
    { q: "Which languages does your staff speak?", a: "Our team communicates in Hindi, English, Bhojpuri and Maithili to serve our diverse community." },
];

const INSURANCE = ["Star Health", "ICICI Lombard", "HDFC Ergo", "LIC", "New India", "United India", "Bajaj Allianz", "Tata AIG"];

const STATS = [
    { val: "25+", label: "Years of Excellence", icon: Award },
    { val: "150+", label: "Specialist Doctors", icon: Users },
    { val: "600", label: "Hospital Beds", icon: Building2 },
    { val: "80,000+", label: "Patients Treated", icon: HeartPulse },
];

/* ─── Helpers ────────────────────────────────────────────── */
const Stars = ({ n = 5 }) => (
    <div className="flex gap-0.5">
        {Array.from({ length: n }).map((_, i) => (
            <Star key={i} size={13} style={{ fill: "#fbbf24", color: "#fbbf24" }} />
        ))}
    </div>
);

const Chip = ({ text, dark = false }) => (
    <FU>
        <span className="font-body inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full text-[11px] font-bold uppercase tracking-widest"
            style={dark
                ? { background: "rgba(255,255,255,.15)", color: "#bde3f5" }
                : { background: "#dff0fb", color: "#0e6396" }}>
            <span className="w-1.5 h-1.5 rounded-full" style={{ background: dark ? "white" : "#0e6396" }} /> {text}
        </span>
    </FU>
);

const H2 = ({ children }) => (
    <FU>
        <h2 className="font-display text-3xl sm:text-4xl md:text-5xl text-slate-900 leading-[1.08] mt-3">
            {children}
        </h2>
    </FU>
);

/* ════════════════════════════════════════════════════════════ */
export default function Home() {
    const navigate = useNavigate();
    const [menu, setMenu] = useState(false);
    const [scrolled, setScrolled] = useState(false);
    const [openFaq, setOpenFaq] = useState(null);
    const [form, setForm] = useState({ name: "", phone: "", email: "", dept: "", date: "", msg: "" });

    useEffect(() => {
        const fn = () => setScrolled(window.scrollY > 56);
        window.addEventListener("scroll", fn);
        return () => window.removeEventListener("scroll", fn);
    }, []);

    const go = id => { document.getElementById(id)?.scrollIntoView({ behavior: "smooth" }); setMenu(false); };

    const NAV = [
        { l: "About", id: "about" }, { l: "Departments", id: "departments" },
        { l: "Doctors", id: "doctors" }, { l: "Services", id: "services" },
        { l: "Appointment", id: "appointment" }, { l: "Contact", id: "contact" },
    ];

    /* ── field focus helpers ── */
    const focusStyle = e => { e.target.style.borderColor = "#0e6396"; e.target.style.boxShadow = "0 0 0 3px rgba(14,99,150,.12)"; };
    const blurStyle = e => { e.target.style.borderColor = "#d4eaf5"; e.target.style.boxShadow = "none"; };
    const inputCls = "w-full px-3.5 py-2.5 rounded-xl font-body text-[14px] text-slate-800 outline-none transition-all";
    const inputStyle = { border: "1px solid #d4eaf5", background: "#f7fbff" };

    return (
        <div className="font-body bg-white text-slate-800">
            <FontStyle />

            {/* ══ TOP BAR + NAVBAR — fixed zone ════════════ */}
            {/* ══ TOP BAR ══════════════════════════════════ */}
            <div className="hidden md:block text-xs py-2.5 px-6" style={{ background: "#0a3a54", color: "#94bfd1" }}>
                <div className="max-w-7xl mx-auto flex items-center justify-between">
                    <div className="flex items-center gap-6 font-body">
                        <a href="tel:+919876543210" className="flex items-center gap-1.5 hover:text-white transition-colors">
                            <Phone size={11} /> Emergency: +91 98765 43210
                        </a>
                        <a href="tel:102" className="flex items-center gap-1.5 hover:text-white transition-colors">
                            <Ambulance size={11} /> Ambulance: 102
                        </a>
                        <span className="flex items-center gap-1.5">
                            <Clock size={11} /> Open 24 Hours, 7 Days
                        </span>
                    </div>
                    <div className="flex items-center gap-5 font-body">
                        <a href="mailto:info@medicore.in" className="flex items-center gap-1.5 hover:text-white transition-colors">
                            <Mail size={11} /> info@medicore.in
                        </a>
                        <span className="flex items-center gap-1.5">
                            <MapPin size={11} /> Exhibition Road, Patna – 800001
                        </span>
                    </div>
                </div>
            </div>

            {/* ══ NAVBAR — fixed, full-width ════════════════ */}
            <header className="sticky top-0 left-0 right-0 z-50 transition-all duration-300"
                style={{
                    background: scrolled ? "rgba(255,255,255,.98)" : "rgba(255,255,255,.95)",
                    boxShadow: scrolled ? "0 2px 28px rgba(0,0,0,.10)" : "0 1px 0 rgba(0,0,0,.06)",
                    backdropFilter: "blur(16px)",
                    WebkitBackdropFilter: "blur(16px)",
                }}>
                <div className="max-w-7xl mx-auto px-4 md:px-6 h-[68px] flex items-center justify-between">

                    {/* Logo */}
                    <button onClick={() => window.scrollTo({ top: 0, behavior: "smooth" })}
                        className="flex items-center gap-2.5">
                        <div className="w-10 h-10 rounded-xl flex items-center justify-center"
                            style={{ background: "linear-gradient(135deg,#0e6396,#0891b2)" }}>
                            <HeartPulse size={22} color="#fff" />
                        </div>
                        <div className="text-left">
                            <div>
                                <span className="font-body text-xl text-slate-900" style={{ fontWeight: 800 }}>Medi</span>
                                <span className="font-body text-xl" style={{ fontWeight: 800, color: "#0e6396" }}>Core</span>
                            </div>
                            <p className="font-body text-[9px] font-semibold uppercase tracking-[.18em] -mt-1" style={{ color: "#8fa8b8" }}>
                                Hospital & Research
                            </p>
                        </div>
                    </button>

                    {/* Desktop nav */}
                    <nav className="hidden lg:flex items-center gap-0.5">
                        {NAV.map(n => (
                            <button key={n.id} onClick={() => go(n.id)}
                                className="nav-link-underline font-body px-4 py-2 text-[13.5px] font-medium text-slate-600 hover:text-[#0e6396] transition-colors rounded-lg hover:bg-slate-50">
                                {n.l}
                            </button>
                        ))}
                    </nav>

                    {/* Desktop CTAs */}
                    <div className="hidden lg:flex items-center gap-3">
                        <button onClick={() => navigate("/login")}
                            className="font-body px-4 py-2 text-[13px] font-semibold text-slate-600 hover:text-[#0e6396] transition-colors">
                            Staff Login
                        </button>
                        <button onClick={() => go("appointment")}
                            className="font-body flex items-center gap-2 px-5 py-2.5 text-[13px] font-semibold text-white rounded-xl hover:opacity-90 active:scale-95 transition-all"
                            style={{ background: "linear-gradient(135deg,#0e6396,#0891b2)", boxShadow: "0 4px 14px rgba(14,99,150,.35)" }}>
                            <Calendar size={15} /> Book Appointment
                        </button>
                    </div>

                    {/* Mobile toggle */}
                    <button onClick={() => setMenu(!menu)}
                        className="lg:hidden p-2 rounded-lg hover:bg-slate-100 text-slate-600">
                        {menu ? <X size={22} /> : <Menu size={22} />}
                    </button>
                </div>

                {/* Mobile menu */}
                <AnimatePresence>
                    {menu && (
                        <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: "auto" }}
                            exit={{ opacity: 0, height: 0 }} transition={{ duration: .2 }}
                            className="lg:hidden border-t bg-white overflow-hidden"
                            style={{ borderColor: "#e4eef5" }}>
                            <div className="px-4 py-4 space-y-1">
                                {NAV.map(n => (
                                    <button key={n.id} onClick={() => go(n.id)}
                                        className="w-full text-left px-4 py-2.5 font-body text-[14px] font-medium text-slate-600 rounded-xl hover:bg-slate-50 hover:text-[#0e6396] transition-colors">
                                        {n.l}
                                    </button>
                                ))}
                                <div className="pt-3 border-t space-y-2" style={{ borderColor: "#e4eef5" }}>
                                    <button onClick={() => navigate("/login")}
                                        className="w-full py-2.5 font-body text-[13px] font-semibold border rounded-xl text-slate-700 hover:bg-slate-50"
                                        style={{ borderColor: "#c8dde8" }}>
                                        Staff / Patient Login
                                    </button>
                                    <button onClick={() => go("appointment")}
                                        className="w-full py-2.5 font-body text-[13px] font-semibold text-white rounded-xl hover:opacity-90"
                                        style={{ background: "linear-gradient(135deg,#0e6396,#0891b2)" }}>
                                        Book Appointment
                                    </button>
                                </div>
                            </div>
                        </motion.div>
                    )}
                </AnimatePresence>
            </header>

            {/* overflow-x wrapper — only on content below sticky header */}
            <div style={{ overflowX: "hidden" }}>

            {/* ══ HERO ══════════════════════════════════════ */}
            <section className="relative overflow-hidden bg-grid-pattern"
                style={{ background: "linear-gradient(150deg,#eef7ff 0%,#ffffff 55%,#f0f8ff 100%)" }}>
                <div className="absolute -top-40 -right-40 w-[600px] h-[600px] rounded-full pointer-events-none"
                    style={{ background: "radial-gradient(circle,rgba(14,99,150,.09),transparent 70%)" }} />
                <div className="absolute -bottom-32 -left-32 w-[480px] h-[480px] rounded-full pointer-events-none"
                    style={{ background: "radial-gradient(circle,rgba(8,145,178,.07),transparent 70%)" }} />

                <div className="relative max-w-7xl mx-auto px-4 md:px-6 pt-20 pb-24 md:pt-28 md:pb-32">
                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-14 items-center">

                        {/* Left */}
                        <motion.div variants={LV} initial="hidden" animate="show" className="space-y-7">
                            <motion.span variants={FV}
                                className="font-body inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full text-[11px] font-bold uppercase tracking-widest"
                                style={{ background: "#dff0fb", color: "#0e6396" }}>
                                <span className="relative flex h-2 w-2">
                                    <span className="ping-anim absolute inline-flex h-full w-full rounded-full" style={{ background: "#0e6396", opacity: .5 }} />
                                    <span className="relative inline-flex rounded-full h-2 w-2" style={{ background: "#0e6396" }} />
                                </span>
                                NABH Accredited · Est. 1999
                            </motion.span>

                            <motion.h1 variants={FV}
                                className="font-display text-5xl sm:text-6xl lg:text-[4.2rem] text-slate-900 leading-[1.06]">
                                Your Health<br />
                                Is Our{" "}
                                <span className="grad-text italic">Priority</span>
                            </motion.h1>

                            <motion.p variants={FV}
                                className="font-body text-[15.5px] text-slate-500 leading-relaxed max-w-lg">
                                Bihar's most trusted multi-specialty hospital — combining cutting-edge technology with genuine human care to deliver outcomes that truly change lives.
                            </motion.p>

                            <motion.div variants={FV} className="flex flex-wrap gap-3">
                                <button onClick={() => go("appointment")}
                                    className="font-body flex items-center gap-2 px-7 py-3.5 text-[14px] font-bold text-white rounded-2xl hover:scale-[1.02] active:scale-95 transition-all"
                                    style={{ background: "linear-gradient(135deg,#0e6396,#0891b2)", boxShadow: "0 6px 22px rgba(14,99,150,.38)" }}>
                                    <Calendar size={17} /> Book Appointment
                                </button>
                                <button onClick={() => go("doctors")}
                                    className="font-body flex items-center gap-2 px-7 py-3.5 text-[14px] font-semibold text-slate-700 rounded-2xl border bg-white hover:scale-[1.02] hover:border-[#0e6396] hover:text-[#0e6396] transition-all"
                                    style={{ borderColor: "#c8dde8" }}>
                                    <Stethoscope size={17} /> Meet Our Doctors
                                </button>
                            </motion.div>

                            <motion.a href="tel:+919876543210" variants={FV}
                                className="inline-flex items-center gap-4 px-5 py-4 rounded-2xl transition-all hover:scale-[1.01] cursor-pointer"
                                style={{ background: "#fff1f2", border: "1px solid #fecdd3" }}>
                                <div className="w-11 h-11 rounded-xl flex items-center justify-center" style={{ background: "#e11d48" }}>
                                    <Ambulance size={20} color="#fff" />
                                </div>
                                <div>
                                    <p className="font-body text-[10.5px] font-bold uppercase tracking-widest" style={{ color: "#be123c" }}>24 / 7 Emergency</p>
                                    <p className="font-body text-[19px] font-bold" style={{ color: "#9f1239" }}>+91 98765 43210</p>
                                </div>
                            </motion.a>
                        </motion.div>

                        {/* Right — stats panel */}
                        <motion.div variants={RV} initial="hidden" animate="show"
                            className="relative hidden lg:block">
                            <div className="relative rounded-3xl overflow-hidden p-8 text-white"
                                style={{
                                    background: "linear-gradient(145deg,#0a3a54 0%,#0e6396 55%,#0891b2 100%)",
                                    boxShadow: "0 32px 64px -16px rgba(14,99,150,.48)",
                                }}>
                                <div className="absolute -top-20 -right-20 w-64 h-64 rounded-full pointer-events-none" style={{ background: "rgba(255,255,255,.05)" }} />
                                <div className="absolute -bottom-16 -left-16 w-48 h-48 rounded-full pointer-events-none" style={{ background: "rgba(255,255,255,.04)" }} />

                                <div className="relative space-y-5">
                                    <div className="flex items-center gap-3">
                                        <div className="w-12 h-12 rounded-2xl flex items-center justify-center" style={{ background: "rgba(255,255,255,.15)" }}>
                                            <HeartPulse size={24} color="#fff" />
                                        </div>
                                        <div>
                                            <p className="font-body font-bold text-[17px]">MediCore Hospital</p>
                                            <p className="font-body text-[13px]" style={{ color: "#7fc8e3" }}>Centre of Excellence, Patna</p>
                                        </div>
                                    </div>

                                    <div className="grid grid-cols-2 gap-3">
                                        {STATS.map(({ val, label, icon: Icon }) => (
                                            <div key={label} className="rounded-2xl p-4" style={{ background: "rgba(255,255,255,.1)" }}>
                                                <Icon size={16} style={{ color: "#7fc8e3", marginBottom: 8 }} />
                                                <p className="font-display text-[26px]">{val}</p>
                                                <p className="font-body text-[11px] mt-0.5" style={{ color: "#7fc8e3" }}>{label}</p>
                                            </div>
                                        ))}
                                    </div>

                                    <div className="rounded-2xl p-4 flex items-center gap-4" style={{ background: "rgba(255,255,255,.1)" }}>
                                        <div className="flex -space-x-2.5">
                                            {["AS", "PN", "RM"].map(i => (
                                                <div key={i} className="w-9 h-9 rounded-full flex items-center justify-center font-body text-xs font-bold border-2"
                                                    style={{ background: "rgba(255,255,255,.25)", borderColor: "#0e6396" }}>{i}</div>
                                            ))}
                                        </div>
                                        <div>
                                            <p className="font-body font-semibold text-[14px]">150+ Specialists</p>
                                            <Stars />
                                        </div>
                                    </div>
                                </div>
                            </div>

                            {/* Floating badge */}
                            <motion.div animate={{ y: [0, -8, 0] }} transition={{ repeat: Infinity, duration: 3, ease: "easeInOut" }}
                                className="absolute -bottom-5 -left-5 bg-white rounded-2xl p-4 flex items-center gap-3"
                                style={{ boxShadow: "0 12px 32px rgba(0,0,0,.12)", border: "1px solid #e4eef5" }}>
                                <div className="w-11 h-11 rounded-xl flex items-center justify-center" style={{ background: "#ecfdf5" }}>
                                    <CheckCircle size={20} style={{ color: "#059669" }} />
                                </div>
                                <div>
                                    <p className="font-body text-[11px] text-slate-400">Patients Today</p>
                                    <p className="font-body font-bold text-slate-800">128 Treated</p>
                                </div>
                            </motion.div>
                        </motion.div>
                    </div>
                </div>
            </section>

            {/* ══ QUICK ACTIONS ═════════════════════════════ */}
            <div className="relative max-w-7xl mx-auto px-4 md:px-6 -mt-7 mb-20 z-10">
                <Reveal className="grid grid-cols-2 lg:grid-cols-4 gap-4">
                    {[
                        { icon: Calendar, label: "Book Appointment", sub: "Schedule instantly online", bg: "#0e6396", action: () => go("appointment") },
                        { icon: Stethoscope, label: "Find a Doctor", sub: "Browse all specialists", bg: "#7c3aed", action: () => go("doctors") },
                        { icon: FlaskConical, label: "Lab Reports", sub: "Access your results", bg: "#059669", action: () => navigate("/login") },
                        { icon: Ambulance, label: "Emergency", sub: "Call ambulance · 102", bg: "#e11d48", action: () => window.open("tel:102") },
                    ].map(({ icon: Icon, label, sub, bg, action }) => (
                        <FU key={label}>
                            <button onClick={action}
                                className="card-lift w-full bg-white rounded-2xl p-5 text-left group"
                                style={{ border: "1px solid #e4eef5", boxShadow: "0 2px 12px rgba(0,0,0,.05)" }}>
                                <div className="w-12 h-12 rounded-xl flex items-center justify-center mb-4 transition-transform group-hover:scale-110"
                                    style={{ background: bg }}>
                                    <Icon size={22} color="#fff" />
                                </div>
                                <p className="font-body font-bold text-slate-900 text-[14px]">{label}</p>
                                <p className="font-body text-[12px] text-slate-400 mt-0.5">{sub}</p>
                            </button>
                        </FU>
                    ))}
                </Reveal>
            </div>

            {/* ══ ABOUT ═════════════════════════════════════ */}
            <section id="about" className="py-20">
                <div className="max-w-7xl mx-auto px-4 md:px-6">
                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 items-center">
                        <Reveal className="space-y-6">
                            <Chip text="About MediCore" />
                            <H2>25 Years of Healing,<br /><span className="grad-text italic">Trust & Excellence</span></H2>
                            <FU>
                                <p className="font-body text-[15px] text-slate-500 leading-relaxed">
                                    Founded in 1999, MediCore has grown to become Bihar's most trusted multi-specialty centre. We combine advanced technology with genuine human care — across 20+ departments, 600 beds and 150+ specialists — to deliver outcomes that truly change lives.
                                </p>
                            </FU>
                            <FU>
                                <div className="space-y-3">
                                    {[
                                        "NABH Accredited — National Board of Hospitals",
                                        "ISO 9001 : 2015 Quality Management Certified",
                                        "24 / 7 Emergency & Trauma Centre",
                                        "Cashless treatment with 25+ insurance partners",
                                    ].map(pt => (
                                        <div key={pt} className="flex items-start gap-3">
                                            <CheckCircle size={16} style={{ color: "#0e6396", flexShrink: 0, marginTop: 3 }} />
                                            <p className="font-body text-[14px] text-slate-600">{pt}</p>
                                        </div>
                                    ))}
                                </div>
                            </FU>
                            <FU>
                                <button onClick={() => go("contact")}
                                    className="font-body flex items-center gap-2 px-6 py-3 text-[13px] font-bold text-white rounded-xl hover:opacity-90 transition-all"
                                    style={{ background: "linear-gradient(135deg,#0e6396,#0891b2)", boxShadow: "0 4px 14px rgba(14,99,150,.35)" }}>
                                    Get in Touch <ArrowRight size={15} />
                                </button>
                            </FU>
                        </Reveal>

                        <Reveal className="grid grid-cols-2 gap-4">
                            {STATS.map(({ val, label, icon: Icon }) => (
                                <FU key={label}>
                                    <div className="card-lift rounded-2xl p-6 text-center"
                                        style={{ background: "#f0f8ff", border: "1px solid #d4eaf5" }}>
                                        <div className="w-12 h-12 rounded-xl flex items-center justify-center mx-auto mb-3" style={{ background: "#dff0fb" }}>
                                            <Icon size={22} style={{ color: "#0e6396" }} />
                                        </div>
                                        <p className="font-display text-3xl text-slate-900">{val}</p>
                                        <p className="font-body text-[12px] text-slate-400 mt-1">{label}</p>
                                    </div>
                                </FU>
                            ))}
                        </Reveal>
                    </div>
                </div>
            </section>

            {/* ══ DEPARTMENTS ══════════════════════════════ */}
            <section id="departments" className="py-20" style={{ background: "#f6fafd" }}>
                <div className="max-w-7xl mx-auto px-4 md:px-6">
                    <Reveal className="text-center mb-12 space-y-3">
                        <Chip text="Our Departments" />
                        <H2>Specialised Care Across<br /><span className="italic">Every Medical Domain</span></H2>
                        <FU>
                            <p className="font-body text-[15px] text-slate-500 max-w-xl mx-auto mt-2 leading-relaxed">
                                Sub-specialty trained clinicians using the latest diagnostic and therapeutic technology — all under one roof.
                            </p>
                        </FU>
                    </Reveal>
                    <Reveal className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4">
                        {DEPTS.map(({ icon: Icon, label, desc, color, bg }) => (
                            <FU key={label}>
                                <div className="card-lift bg-white rounded-2xl p-5 cursor-pointer group"
                                    style={{ border: "1px solid #e4eef5" }}>
                                    <div className="w-12 h-12 rounded-xl flex items-center justify-center mb-4 transition-transform group-hover:scale-110"
                                        style={{ background: bg }}>
                                        <Icon size={22} style={{ color }} />
                                    </div>
                                    <p className="font-body font-bold text-slate-900 text-[14px]">{label}</p>
                                    <p className="font-body text-[12px] text-slate-400 mt-1 leading-snug">{desc}</p>
                                    <div className="flex items-center gap-1 mt-3 font-body text-[12px] font-semibold opacity-0 group-hover:opacity-100 transition-opacity"
                                        style={{ color: "#0e6396" }}>
                                        Learn More <ChevronRight size={12} />
                                    </div>
                                </div>
                            </FU>
                        ))}
                    </Reveal>
                </div>
            </section>

            {/* ══ SERVICES ══════════════════════════════════ */}
            <section id="services" className="py-20 relative overflow-hidden"
                style={{ background: "linear-gradient(150deg,#0a3a54 0%,#0e6396 100%)" }}>
                <div className="absolute inset-0 pointer-events-none"
                    style={{ background: "radial-gradient(ellipse at 75% 15%,rgba(255,255,255,.07),transparent 55%)" }} />
                <div className="relative max-w-7xl mx-auto px-4 md:px-6">
                    <Reveal className="text-center mb-12 space-y-3">
                        <Chip text="Our Services" dark />
                        <FU>
                            <h2 className="font-display text-3xl sm:text-4xl md:text-5xl text-white leading-[1.08] mt-3">
                                Comprehensive Care<br /><span className="italic" style={{ color: "#7fc8e3" }}>Under One Roof</span>
                            </h2>
                        </FU>
                        <FU>
                            <p className="font-body text-[15px] max-w-lg mx-auto mt-2 leading-relaxed" style={{ color: "#94bfd1" }}>
                                Everything you need — available around the clock, 365 days a year.
                            </p>
                        </FU>
                    </Reveal>
                    <Reveal className="grid grid-cols-2 md:grid-cols-4 gap-4">
                        {SERVICES.map(({ icon: Icon, label, desc }) => (
                            <FU key={label}>
                                <div className="rounded-2xl p-5 cursor-pointer group transition-all hover:scale-[1.03]"
                                    style={{ background: "rgba(255,255,255,.08)", border: "1px solid rgba(255,255,255,.12)" }}>
                                    <div className="w-11 h-11 rounded-xl flex items-center justify-center mb-4"
                                        style={{ background: "rgba(255,255,255,.15)" }}>
                                        <Icon size={20} color="#7fc8e3" />
                                    </div>
                                    <p className="font-body font-bold text-white text-[13.5px]">{label}</p>
                                    <p className="font-body text-[12px] mt-1 leading-snug" style={{ color: "#94bfd1" }}>{desc}</p>
                                </div>
                            </FU>
                        ))}
                    </Reveal>
                </div>
            </section>

            {/* ══ DOCTORS ═══════════════════════════════════ */}
            <section id="doctors" className="py-20">
                <div className="max-w-7xl mx-auto px-4 md:px-6">
                    <Reveal className="text-center mb-12 space-y-3">
                        <Chip text="Our Specialists" />
                        <H2>Meet Our Expert<br /><span className="italic grad-text">Doctors</span></H2>
                        <FU>
                            <p className="font-body text-[15px] text-slate-500 max-w-lg mx-auto mt-2 leading-relaxed">
                                Board-certified specialists with decades of collective experience, committed to evidence-based, patient-centred care.
                            </p>
                        </FU>
                    </Reveal>
                    <Reveal className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5 mb-8">
                        {DOCTORS.map(({ name, spec, exp, init, bg, fg }) => (
                            <FU key={name}>
                                <div className="card-lift bg-white rounded-2xl overflow-hidden" style={{ border: "1px solid #e4eef5" }}>
                                    <div className="h-32 flex items-center justify-center" style={{ background: bg }}>
                                        <div className="w-20 h-20 rounded-2xl flex items-center justify-center font-body text-2xl font-bold"
                                            style={{ background: "white", color: fg, boxShadow: "0 4px 16px rgba(0,0,0,.1)" }}>
                                            {init}
                                        </div>
                                    </div>
                                    <div className="p-4">
                                        <p className="font-body font-bold text-slate-900 text-[14px]">{name}</p>
                                        <p className="font-body text-[12.5px] font-semibold mt-0.5" style={{ color: "#0e6396" }}>{spec}</p>
                                        <p className="font-body text-[12px] text-slate-400 mt-1">{exp} experience</p>
                                        <div className="mt-1"><Stars /></div>
                                        <button onClick={() => go("appointment")}
                                            className="mt-3 w-full py-2 font-body text-[12px] font-semibold rounded-xl hover:opacity-80 transition-opacity"
                                            style={{ background: "#f0f8ff", color: "#0e6396" }}>
                                            Book Appointment
                                        </button>
                                    </div>
                                </div>
                            </FU>
                        ))}
                    </Reveal>
                    <Reveal>
                        <FU className="text-center">
                            <button onClick={() => navigate("/login")}
                                className="font-body inline-flex items-center gap-2 px-6 py-3 text-[13px] font-semibold rounded-xl hover:bg-[#f0f8ff] transition-colors"
                                style={{ border: "1px solid #c8dde8", color: "#0e6396" }}>
                                View All 150+ Doctors <ArrowRight size={15} />
                            </button>
                        </FU>
                    </Reveal>
                </div>
            </section>

            {/* ══ WHY CHOOSE US ═════════════════════════════ */}
            <section className="py-20" style={{ background: "linear-gradient(135deg,#eef7ff 0%,#e8f5fd 100%)" }}>
                <div className="max-w-7xl mx-auto px-4 md:px-6">
                    <Reveal className="text-center mb-12 space-y-3">
                        <Chip text="Why MediCore" />
                        <H2>Why Thousands of Families<br /><span className="italic grad-text">Trust Us</span></H2>
                    </Reveal>
                    <Reveal className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
                        {[
                            { icon: Award, title: "NABH Accredited", desc: "Nationally recognised quality & patient safety protocols across all departments." },
                            { icon: Users, title: "150+ Specialists", desc: "Sub-specialty trained physicians across every major medical discipline." },
                            { icon: HeartPulse, title: "24/7 Emergency", desc: "Round-the-clock trauma bay with dedicated emergency physicians and nursing staff." },
                            { icon: Scan, title: "Advanced Technology", desc: "3T MRI, 128-slice CT, Da Vinci robotic surgery & digital pathology." },
                            { icon: Shield, title: "Cashless Insurance", desc: "Direct billing with 25+ leading insurers — zero out-of-pocket hassle." },
                            { icon: MessageCircle, title: "Dedicated Support", desc: "Personal care coordinators guide you from admission to full recovery." },
                        ].map(({ icon: Icon, title, desc }) => (
                            <FU key={title}>
                                <div className="card-lift bg-white rounded-2xl p-6" style={{ border: "1px solid #d4eaf5" }}>
                                    <div className="w-11 h-11 rounded-xl flex items-center justify-center mb-4" style={{ background: "#dff0fb" }}>
                                        <Icon size={20} style={{ color: "#0e6396" }} />
                                    </div>
                                    <p className="font-body font-bold text-slate-900 text-[14.5px]">{title}</p>
                                    <p className="font-body text-[13px] text-slate-500 mt-2 leading-relaxed">{desc}</p>
                                </div>
                            </FU>
                        ))}
                    </Reveal>
                </div>
            </section>

            {/* ══ HEALTH PACKAGES ═══════════════════════════ */}
            <section className="py-20">
                <div className="max-w-7xl mx-auto px-4 md:px-6">
                    <Reveal className="text-center mb-12 space-y-3">
                        <Chip text="Health Packages" />
                        <H2>Preventive Health<br /><span className="italic grad-text">Checkup Plans</span></H2>
                        <FU>
                            <p className="font-body text-[15px] text-slate-500 max-w-lg mx-auto mt-2">
                                Affordable, comprehensive packages for proactive health management.
                            </p>
                        </FU>
                    </Reveal>
                    <Reveal className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
                        {PACKAGES.map(({ name, price, tests, color, accent, popular }) => (
                            <FU key={name}>
                                <div className={`card-lift rounded-2xl overflow-hidden bg-white relative`}
                                    style={{
                                        border: popular ? `2px solid ${accent}` : "1px solid #e4eef5",
                                        boxShadow: popular ? `0 4px 20px ${accent}26` : undefined,
                                    }}>
                                    {popular && (
                                        <div className="absolute top-3 right-3 font-body px-2.5 py-1 rounded-full text-[10px] font-bold text-white"
                                            style={{ background: accent }}>Most Popular</div>
                                    )}
                                    <div className="p-5" style={{ background: color }}>
                                        <p className="font-body font-bold text-slate-900 text-[15px]">{name}</p>
                                        <p className="font-display text-3xl mt-1" style={{ color: accent }}>{price}</p>
                                        <p className="font-body text-[11px] text-slate-400 mb-1">per person</p>
                                    </div>
                                    <div className="p-5 space-y-2">
                                        {tests.map(t => (
                                            <div key={t} className="flex items-center gap-2">
                                                <CheckCircle size={13} style={{ color: accent, flexShrink: 0 }} />
                                                <p className="font-body text-[12.5px] text-slate-600">{t}</p>
                                            </div>
                                        ))}
                                        <button onClick={() => go("appointment")}
                                            className="mt-4 w-full py-2.5 font-body text-[13px] font-bold text-white rounded-xl hover:opacity-90 transition-opacity"
                                            style={{ background: accent }}>
                                            Book Now
                                        </button>
                                    </div>
                                </div>
                            </FU>
                        ))}
                    </Reveal>
                </div>
            </section>

            {/* ══ TESTIMONIALS ══════════════════════════════ */}
            <section className="py-20" style={{ background: "#f6fafd" }}>
                <div className="max-w-7xl mx-auto px-4 md:px-6">
                    <Reveal className="text-center mb-12 space-y-3">
                        <Chip text="Testimonials" />
                        <H2>What Our Patients<br /><span className="italic grad-text">Say About Us</span></H2>
                    </Reveal>
                    <Reveal className="grid grid-cols-1 md:grid-cols-3 gap-5">
                        {TESTIMONIALS.map(({ name, tx, rating, text }) => (
                            <FU key={name}>
                                <div className="card-lift bg-white rounded-2xl p-6 flex flex-col gap-4" style={{ border: "1px solid #e4eef5" }}>
                                    <Stars n={rating} />
                                    <p className="font-body text-[14px] text-slate-600 leading-relaxed flex-1">"{text}"</p>
                                    <div className="flex items-center gap-3 pt-4" style={{ borderTop: "1px solid #f0f4f7" }}>
                                        <div className="w-10 h-10 rounded-full flex items-center justify-center font-body font-bold text-sm"
                                            style={{ background: "#dff0fb", color: "#0e6396" }}>{name[0]}</div>
                                        <div>
                                            <p className="font-body font-bold text-slate-900 text-[13.5px]">{name}</p>
                                            <p className="font-body text-[11px] text-slate-400">{tx}</p>
                                        </div>
                                    </div>
                                </div>
                            </FU>
                        ))}
                    </Reveal>
                </div>
            </section>

            {/* ══ APPOINTMENT ═══════════════════════════════ */}
            <section id="appointment" className="py-20 relative overflow-hidden"
                style={{ background: "linear-gradient(150deg,#0a3a54 0%,#0e6396 55%,#0891b2 100%)" }}>
                <div className="absolute inset-0 pointer-events-none"
                    style={{ background: "radial-gradient(ellipse at 10% 80%,rgba(255,255,255,.07),transparent 55%)" }} />
                <div className="relative max-w-7xl mx-auto px-4 md:px-6">
                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-14 items-start">

                        <Reveal className="space-y-7">
                            <Chip text="Book Appointment" dark />
                            <FU>
                                <h2 className="font-display text-4xl md:text-5xl text-white leading-tight mt-3">
                                    Schedule Your<br /><span className="italic" style={{ color: "#7fc8e3" }}>Visit Today</span>
                                </h2>
                            </FU>
                            <FU>
                                <p className="font-body text-[15px] leading-relaxed" style={{ color: "#94bfd1" }}>
                                    Fill in the form and our team will confirm your appointment within 2 hours. For urgent needs, call us directly.
                                </p>
                            </FU>
                            <div className="space-y-4">
                                {[
                                    { icon: Phone, l: "Emergency Helpline", v: "+91 98765 43210" },
                                    { icon: Mail, l: "Email", v: "appointments@medicore.in" },
                                    { icon: MapPin, l: "Address", v: "Exhibition Road, Patna – 800001" },
                                    { icon: Clock, l: "OPD Hours", v: "Mon–Sat  8 AM – 8 PM" },
                                ].map(({ icon: Icon, l, v }) => (
                                    <FU key={l}>
                                        <div className="flex items-center gap-4">
                                            <div className="w-10 h-10 rounded-xl flex items-center justify-center shrink-0"
                                                style={{ background: "rgba(255,255,255,.15)" }}>
                                                <Icon size={16} color="#7fc8e3" />
                                            </div>
                                            <div>
                                                <p className="font-body text-[11px] font-bold uppercase tracking-wide" style={{ color: "#7fc8e3" }}>{l}</p>
                                                <p className="font-body text-[14px] font-semibold text-white">{v}</p>
                                            </div>
                                        </div>
                                    </FU>
                                ))}
                            </div>
                        </Reveal>

                        <Reveal>
                            <FU>
                                <div className="bg-white rounded-3xl p-8 shadow-2xl">
                                    <p className="font-body font-bold text-slate-900 text-[16px] mb-6">Fill in Your Details</p>
                                    <div className="space-y-4">
                                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                            <div>
                                                <label className="font-body text-[11px] font-bold uppercase tracking-wide text-slate-400 block mb-1.5">Full Name</label>
                                                <input type="text" value={form.name} placeholder="Your full name"
                                                    onChange={e => setForm({ ...form, name: e.target.value })}
                                                    className={inputCls} style={inputStyle}
                                                    onFocus={focusStyle} onBlur={blurStyle} />
                                            </div>
                                            <div>
                                                <label className="font-body text-[11px] font-bold uppercase tracking-wide text-slate-400 block mb-1.5">Phone Number</label>
                                                <input type="tel" value={form.phone} placeholder="+91 00000 00000"
                                                    onChange={e => setForm({ ...form, phone: e.target.value })}
                                                    className={inputCls} style={inputStyle}
                                                    onFocus={focusStyle} onBlur={blurStyle} />
                                            </div>
                                        </div>
                                        <div>
                                            <label className="font-body text-[11px] font-bold uppercase tracking-wide text-slate-400 block mb-1.5">Email Address</label>
                                            <input type="email" value={form.email} placeholder="your@email.com"
                                                onChange={e => setForm({ ...form, email: e.target.value })}
                                                className={inputCls} style={inputStyle}
                                                onFocus={focusStyle} onBlur={blurStyle} />
                                        </div>
                                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                            <div>
                                                <label className="font-body text-[11px] font-bold uppercase tracking-wide text-slate-400 block mb-1.5">Department</label>
                                                <select value={form.dept} onChange={e => setForm({ ...form, dept: e.target.value })}
                                                    className={inputCls} style={inputStyle}>
                                                    <option value="">Select Department</option>
                                                    {DEPTS.map(d => <option key={d.label} value={d.label}>{d.label}</option>)}
                                                </select>
                                            </div>
                                            <div>
                                                <label className="font-body text-[11px] font-bold uppercase tracking-wide text-slate-400 block mb-1.5">Preferred Date</label>
                                                <input type="date" value={form.date}
                                                    min={new Date().toISOString().split("T")[0]}
                                                    onChange={e => setForm({ ...form, date: e.target.value })}
                                                    className={inputCls} style={inputStyle} />
                                            </div>
                                        </div>
                                        <div>
                                            <label className="font-body text-[11px] font-bold uppercase tracking-wide text-slate-400 block mb-1.5">Message (optional)</label>
                                            <textarea value={form.msg} rows={3} placeholder="Briefly describe your symptoms..."
                                                onChange={e => setForm({ ...form, msg: e.target.value })}
                                                className={`${inputCls} resize-none`} style={inputStyle}
                                                onFocus={focusStyle} onBlur={blurStyle} />
                                        </div>
                                        <button onClick={() => navigate("/login")}
                                            className="w-full py-3.5 font-body text-[14px] font-bold text-white rounded-xl hover:opacity-90 active:scale-95 transition-all"
                                            style={{ background: "linear-gradient(135deg,#0e6396,#0891b2)", boxShadow: "0 6px 20px rgba(14,99,150,.38)" }}>
                                            Request Appointment
                                        </button>
                                        <p className="font-body text-center text-[12px] text-slate-400">
                                            Our team will call you within 2 hours to confirm.
                                        </p>
                                    </div>
                                </div>
                            </FU>
                        </Reveal>
                    </div>
                </div>
            </section>

            {/* ══ INSURANCE PARTNERS ════════════════════════ */}
            <section className="py-14">
                <div className="max-w-7xl mx-auto px-4 md:px-6">
                    <Reveal className="text-center mb-8">
                        <FU>
                            <p className="font-body text-[11px] font-bold uppercase tracking-widest text-slate-400">
                                Cashless Insurance Partners
                            </p>
                        </FU>
                    </Reveal>
                    <Reveal className="flex flex-wrap items-center justify-center gap-3">
                        {INSURANCE.map(ins => (
                            <FU key={ins}>
                                <div className="font-body px-5 py-2.5 rounded-xl text-[13px] font-semibold text-slate-600 cursor-pointer hover:scale-105 transition-transform"
                                    style={{ background: "#f0f8ff", border: "1px solid #d4eaf5" }}>
                                    {ins}
                                </div>
                            </FU>
                        ))}
                    </Reveal>
                </div>
            </section>

            {/* ══ FAQ ═══════════════════════════════════════ */}
            <section className="py-20" style={{ background: "#f6fafd" }}>
                <div className="max-w-3xl mx-auto px-4 md:px-6">
                    <Reveal className="text-center mb-12 space-y-3">
                        <Chip text="FAQ" />
                        <H2>Frequently Asked<br /><span className="italic grad-text">Questions</span></H2>
                    </Reveal>
                    <div className="space-y-3">
                        {FAQS.map(({ q, a }, i) => (
                            <Reveal key={i}>
                                <FU>
                                    <div className="bg-white rounded-2xl overflow-hidden" style={{ border: "1px solid #d4eaf5" }}>
                                        <button onClick={() => setOpenFaq(openFaq === i ? null : i)}
                                            className="w-full flex items-center justify-between px-6 py-4 text-left gap-3">
                                            <p className="font-body font-semibold text-slate-800 text-[14px]">{q}</p>
                                            <ChevronDown size={17} className="shrink-0 transition-transform"
                                                style={{ color: "#0e6396", transform: openFaq === i ? "rotate(180deg)" : "none" }} />
                                        </button>
                                        <AnimatePresence>
                                            {openFaq === i && (
                                                <motion.div initial={{ height: 0, opacity: 0 }} animate={{ height: "auto", opacity: 1 }}
                                                    exit={{ height: 0, opacity: 0 }} transition={{ duration: .22 }}>
                                                    <div className="px-6 pb-5" style={{ borderTop: "1px solid #e8f0f5" }}>
                                                        <p className="font-body text-[14px] text-slate-500 leading-relaxed pt-3">{a}</p>
                                                    </div>
                                                </motion.div>
                                            )}
                                        </AnimatePresence>
                                    </div>
                                </FU>
                            </Reveal>
                        ))}
                    </div>
                </div>
            </section>

            {/* ══ EMERGENCY CTA ═════════════════════════════ */}
            <section className="py-14 relative overflow-hidden"
                style={{ background: "linear-gradient(135deg,#be123c,#e11d48,#f43f5e)" }}>
                <div className="absolute inset-0 pointer-events-none"
                    style={{ background: "radial-gradient(ellipse at 20% 50%,rgba(255,255,255,.1),transparent 55%)" }} />
                <div className="relative max-w-7xl mx-auto px-4 md:px-6 flex flex-col md:flex-row items-center justify-between gap-6">
                    <div className="flex items-center gap-5">
                        <div className="w-14 h-14 rounded-2xl flex items-center justify-center shrink-0"
                            style={{ background: "rgba(255,255,255,.2)" }}>
                            <Ambulance size={28} color="#fff" />
                        </div>
                        <div>
                            <p className="font-display text-[1.6rem] text-white">Need Emergency Care?</p>
                            <p className="font-body text-[14px] mt-0.5" style={{ color: "#fda4af" }}>
                                Our trauma team is available 24 / 7 — every single day of the year.
                            </p>
                        </div>
                    </div>
                    <div className="flex flex-col sm:flex-row gap-3 shrink-0">
                        <a href="tel:+919876543210"
                            className="font-body flex items-center gap-2 px-6 py-3.5 bg-white font-bold text-[14px] rounded-xl hover:bg-red-50 transition-colors"
                            style={{ color: "#be123c" }}>
                            <Phone size={16} /> +91 98765 43210
                        </a>
                        <a href="tel:102"
                            className="font-body flex items-center gap-2 px-6 py-3.5 font-bold text-[14px] text-white rounded-xl hover:opacity-90 transition-opacity"
                            style={{ background: "rgba(0,0,0,.2)" }}>
                            <Ambulance size={16} /> Ambulance : 102
                        </a>
                    </div>
                </div>
            </section>

            {/* ══ CONTACT ═══════════════════════════════════ */}
            <section id="contact" className="py-20">
                <div className="max-w-7xl mx-auto px-4 md:px-6">
                    <Reveal className="text-center mb-12 space-y-3">
                        <Chip text="Contact Us" />
                        <H2>Visit Us or<br /><span className="italic grad-text">Get in Touch</span></H2>
                    </Reveal>
                    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                        <Reveal className="space-y-4">
                            {[
                                { icon: MapPin, l: "Address", v: "Exhibition Road, Near Gandhi Maidan\nPatna, Bihar – 800001" },
                                { icon: Phone, l: "Phone", v: "+91 98765 43210\n+91 0612 345678" },
                                { icon: Mail, l: "Email", v: "info@medicore.in" },
                                { icon: Clock, l: "Working Hours", v: "OPD: Mon–Sat  8 AM – 8 PM\nEmergency: 24 / 7" },
                            ].map(({ icon: Icon, l, v }) => (
                                <FU key={l}>
                                    <div className="flex items-start gap-4 p-4 rounded-2xl bg-white" style={{ border: "1px solid #d4eaf5" }}>
                                        <div className="w-10 h-10 rounded-xl flex items-center justify-center shrink-0" style={{ background: "#dff0fb" }}>
                                            <Icon size={16} style={{ color: "#0e6396" }} />
                                        </div>
                                        <div>
                                            <p className="font-body text-[11px] font-bold uppercase tracking-wide text-slate-400">{l}</p>
                                            <p className="font-body text-[13.5px] font-semibold text-slate-700 mt-0.5 whitespace-pre-line">{v}</p>
                                        </div>
                                    </div>
                                </FU>
                            ))}
                        </Reveal>

                        <Reveal className="lg:col-span-2">
                            <FU>
                                <div className="rounded-3xl overflow-hidden flex items-center justify-center h-80 lg:h-full min-h-64"
                                    style={{ background: "linear-gradient(135deg,#dff0fb,#e8f5fd)", border: "1px solid #d4eaf5" }}>
                                    <div className="text-center">
                                        <MapPin size={36} style={{ color: "#0e6396", margin: "0 auto 8px" }} />
                                        <p className="font-body font-semibold text-slate-600 text-[14px]">Google Maps</p>
                                        <p className="font-body text-slate-400 text-[12px] mt-1">Exhibition Road, Patna – 800001</p>
                                        <a href="https://maps.google.com" target="_blank" rel="noreferrer"
                                            className="mt-4 inline-flex items-center gap-1.5 font-body text-[12px] font-semibold px-4 py-2 text-white rounded-lg hover:opacity-90 transition-opacity"
                                            style={{ background: "#0e6396" }}>
                                            Open in Google Maps <ArrowRight size={13} />
                                        </a>
                                    </div>
                                </div>
                            </FU>
                        </Reveal>
                    </div>
                </div>
            </section>

            {/* ══ FOOTER ════════════════════════════════════ */}
            <footer style={{ background: "#0a3a54" }}>
                <div className="max-w-7xl mx-auto px-4 md:px-6 pt-14 pb-8">
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-10 mb-10">

                        {/* Brand */}
                        <div className="space-y-4">
                            <div className="flex items-center gap-2.5">
                                <div className="w-9 h-9 rounded-xl flex items-center justify-center"
                                    style={{ background: "linear-gradient(135deg,#0e6396,#0891b2)" }}>
                                    <HeartPulse size={19} color="#fff" />
                                </div>
                                <div>
                                    <span className="font-body text-lg text-white" style={{ fontWeight: 800 }}>Medi</span>
                                    <span className="font-body text-lg" style={{ fontWeight: 800, color: "#7fc8e3" }}>Core</span>
                                </div>
                            </div>
                            <p className="font-body text-[13px] leading-relaxed" style={{ color: "#7498a8" }}>
                                Delivering compassionate, world-class healthcare to every patient since 1999.
                            </p>
                            <div className="flex gap-2">
                                {["F", "T", "I", "Y"].map(l => (
                                    <div key={l} className="w-8 h-8 rounded-lg flex items-center justify-center cursor-pointer transition-colors hover:bg-[#0e6396]"
                                        style={{ background: "rgba(255,255,255,.08)" }}>
                                        <span className="font-body text-[11px] font-bold" style={{ color: "#7fc8e3" }}>{l}</span>
                                    </div>
                                ))}
                            </div>
                        </div>

                        {/* Quick Links */}
                        <div>
                            <p className="font-body font-bold text-white text-[12px] uppercase tracking-widest mb-4">Quick Links</p>
                            <div className="space-y-2">
                                {[
                                    { label: "About Us", id: "about" },
                                    { label: "Departments", id: "departments" },
                                    { label: "Our Doctors", id: "doctors" },
                                    { label: "Services", id: "services" },
                                    { label: "Book Appointment", id: "appointment" },
                                    { label: "Contact Us", id: "contact" },
                                ].map(({ label, id }) => (
                                    <button key={id} onClick={() => go(id)}
                                        className="font-body block text-[13px] transition-colors hover:text-white"
                                        style={{ color: "#7498a8" }}>
                                        {label}
                                    </button>
                                ))}
                            </div>
                        </div>

                        {/* Departments */}
                        <div>
                            <p className="font-body font-bold text-white text-[12px] uppercase tracking-widest mb-4">Departments</p>
                            <div className="space-y-2">
                                {["Cardiology", "Neurology", "Orthopedics", "Pediatrics", "Oncology", "Emergency", "Ophthalmology", "Radiology"].map(d => (
                                    <p key={d} className="font-body text-[13px] cursor-pointer transition-colors hover:text-white"
                                        style={{ color: "#7498a8" }}>{d}</p>
                                ))}
                            </div>
                        </div>

                        {/* Contact + Login */}
                        <div>
                            <p className="font-body font-bold text-white text-[12px] uppercase tracking-widest mb-4">Contact</p>
                            <div className="space-y-3">
                                <p className="flex items-start gap-2 font-body text-[13px]" style={{ color: "#7498a8" }}>
                                    <MapPin size={13} style={{ color: "#7fc8e3", marginTop: 2, flexShrink: 0 }} /> Exhibition Road, Patna – 800001
                                </p>
                                <p className="flex items-center gap-2 font-body text-[13px]" style={{ color: "#7498a8" }}>
                                    <Phone size={13} style={{ color: "#7fc8e3" }} /> +91 98765 43210
                                </p>
                                <p className="flex items-center gap-2 font-body text-[13px]" style={{ color: "#7498a8" }}>
                                    <Mail size={13} style={{ color: "#7fc8e3" }} /> info@medicore.in
                                </p>
                            </div>
                            <button onClick={() => navigate("/login")}
                                className="mt-5 w-full font-body flex items-center justify-center gap-2 py-2.5 text-[13px] font-bold text-white rounded-xl hover:opacity-90 transition-all"
                                style={{ background: "linear-gradient(135deg,#0e6396,#0891b2)" }}>
                                Staff / Patient Login <ArrowRight size={14} />
                            </button>
                        </div>
                    </div>

                    {/* Bottom bar */}
                    <div className="flex flex-col sm:flex-row items-center justify-between gap-3 pt-8 font-body text-[12px]"
                        style={{ borderTop: "1px solid rgba(255,255,255,.08)", color: "#4e7080" }}>
                        <p>© 2026 MediCore Hospital & Research Centre. All rights reserved.</p>
                        <div className="flex gap-5">
                            {["Privacy Policy", "Terms of Service", "Disclaimer"].map(l => (
                                <span key={l} className="cursor-pointer hover:text-white transition-colors">{l}</span>
                            ))}
                        </div>
                    </div>
                </div>
            </footer>
            </div>{/* end overflow-x wrapper */}
        </div>
    );
}