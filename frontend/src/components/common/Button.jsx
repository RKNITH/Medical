import Loader from "./Loader.jsx";

const Button = ({
    children,
    onClick,
    type = "button",
    variant = "primary",
    size = "md",
    loading = false,
    disabled = false,
    className = "",
    icon: Icon,
}) => {
    const variants = {
        // Hospital blue gradient for primary actions
        primary: "text-white shadow-sm hover:opacity-90 active:scale-[.98]",
        secondary: "bg-slate-100 hover:bg-slate-200 text-slate-700",
        danger: "bg-red-500 hover:bg-red-600 text-white shadow-sm",
        outline: "border border-slate-200 hover:bg-slate-50 text-slate-700",
        ghost: "hover:bg-slate-100 text-slate-600",
        success: "bg-emerald-500 hover:bg-emerald-600 text-white shadow-sm",
    };

    const primaryStyle = variant === "primary"
        ? { background: "linear-gradient(135deg,#0e6396,#0891b2)" }
        : {};

    const sizes = {
        sm: "px-3 py-1.5 text-xs",
        md: "px-4 py-2 text-sm",
        lg: "px-5 py-2.5 text-sm",
    };

    return (
        <button
            type={type}
            onClick={onClick}
            disabled={disabled || loading}
            style={primaryStyle}
            className={`
                inline-flex items-center justify-center gap-2 rounded-xl font-semibold
                transition-all duration-150 cursor-pointer
                disabled:opacity-50 disabled:cursor-not-allowed
                ${variants[variant]} ${sizes[size]} ${className}
            `}
        >
            {loading ? (
                <Loader size="sm" />
            ) : (
                <>
                    {Icon && <Icon size={15} />}
                    {children}
                </>
            )}
        </button>
    );
};

export default Button;
