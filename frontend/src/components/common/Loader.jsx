const Loader = ({ size = "md", fullscreen = false }) => {
    const s = size === "lg" ? 40 : size === "sm" ? 18 : 28;
    const ring = size === "lg" ? "w-12 h-12" : size === "sm" ? "w-6 h-6" : "w-9 h-9";
    const border = size === "lg" ? "border-[3px]" : "border-2";

    const inner = (
        <div className="flex flex-col items-center gap-3">
            <div className={`${ring} ${border} border-slate-200 border-t-sky-600 rounded-full animate-spin`} />
            {size === "lg" && (
                <p className="text-sm text-slate-400 font-medium animate-pulse">Loading…</p>
            )}
        </div>
    );

    if (fullscreen) {
        return (
            <div className="fixed inset-0 flex items-center justify-center bg-white/80 backdrop-blur-sm z-50">
                {inner}
            </div>
        );
    }

    return inner;
};

export default Loader;
