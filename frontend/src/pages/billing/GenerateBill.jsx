import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useSelector } from "react-redux";
import api from "../../api/axios.js";
import useFetch from "../../hooks/useFetch.js";
import { ArrowLeft, Plus, Trash2, CheckCircle, Receipt } from "lucide-react";
import Button from "../../components/common/Button.jsx";
import Loader from "../../components/common/Loader.jsx";

const ITEM_TYPES = ["consultation", "lab", "pharmacy", "bed", "other"];

const GenerateBill = () => {
    const navigate = useNavigate();
    const { user } = useSelector((state) => state.auth);

    const { data: patientsData, loading: pLoading } = useFetch("/patients", { limit: 100 });
    const { data: appointmentsData } = useFetch("/appointments", { status: "completed", limit: 100 });

    const [selectedPatient, setSelectedPatient] = useState("");
    const [selectedAppointment, setSelectedAppointment] = useState("");
    const [items, setItems] = useState([{ description: "", type: "consultation", amount: 0 }]);
    const [discount, setDiscount] = useState(0);
    const [paymentMode, setPaymentMode] = useState("cash");
    const [paymentStatus, setPaymentStatus] = useState("paid");
    const [submitting, setSubmitting] = useState(false);
    const [error, setError] = useState(null);
    const [success, setSuccess] = useState(false);
    const [generatedBill, setGeneratedBill] = useState(null);

    const addItem = () => {
        setItems([...items, { description: "", type: "consultation", amount: 0 }]);
    };

    const removeItem = (index) => {
        setItems(items.filter((_, i) => i !== index));
    };

    const updateItem = (index, field, value) => {
        const updated = [...items];
        updated[index][field] = field === "amount" ? Number(value) : value;
        setItems(updated);
    };

    const totalAmount = items.reduce((sum, item) => sum + Number(item.amount || 0), 0);
    const finalAmount = totalAmount - Number(discount || 0);

    const handleSubmit = async () => {
        if (!selectedPatient) { setError("Please select a patient."); return; }
        if (items.some((i) => !i.description || !i.amount)) {
            setError("Please fill all item details.");
            return;
        }
        if (finalAmount < 0) { setError("Discount cannot exceed total amount."); return; }

        setSubmitting(true);
        setError(null);
        try {
            const { data } = await api.post("/billing", {
                patient: selectedPatient,
                appointment: selectedAppointment || undefined,
                items,
                discount: Number(discount),
                paymentMode,
                paymentStatus,
                generatedBy: user._id,
            });
            setGeneratedBill(data.data);
            setSuccess(true);
        } catch (err) {
            setError(err.response?.data?.message || "Failed to generate bill.");
        } finally {
            setSubmitting(false);
        }
    };

    if (success && generatedBill) {
        return (
            <div className="max-w-lg mx-auto mt-16 flex flex-col items-center gap-5 text-center">
                <div className="w-16 h-16 rounded-2xl bg-emerald-50 flex items-center justify-center">
                    <CheckCircle size={32} className="text-emerald-500" />
                </div>
                <div>
                    <h2 className="text-xl font-bold text-slate-800">Bill Generated!</h2>
                    <p className="text-sm text-slate-500 mt-1">
                        Bill <span className="font-mono font-semibold">{generatedBill.billNo}</span> has been created successfully.
                    </p>
                </div>
                <div className="w-full bg-white rounded-2xl border border-slate-100 shadow-sm p-5 text-left space-y-3">
                    <div className="flex justify-between text-sm">
                        <span className="text-slate-500">Total Amount</span>
                        <span className="font-semibold text-slate-800">₹{generatedBill.totalAmount}</span>
                    </div>
                    {generatedBill.discount > 0 && (
                        <div className="flex justify-between text-sm">
                            <span className="text-slate-500">Discount</span>
                            <span className="text-emerald-600 font-semibold">-₹{generatedBill.discount}</span>
                        </div>
                    )}
                    <div className="flex justify-between text-base font-bold border-t border-slate-100 pt-3">
                        <span className="text-slate-700">Final Amount</span>
                        <span className="text-slate-800">₹{generatedBill.finalAmount}</span>
                    </div>
                    <div className="flex justify-between text-sm">
                        <span className="text-slate-500">Payment Status</span>
                        <span className={`font-semibold capitalize ${generatedBill.paymentStatus === "paid" ? "text-emerald-600" : "text-amber-600"}`}>
                            {generatedBill.paymentStatus}
                        </span>
                    </div>
                </div>
                <div className="flex gap-3">
                    <Button
                        variant="outline"
                        icon={Receipt}
                        onClick={() => window.open(`${import.meta.env.VITE_API_URL}/billing/${generatedBill._id}/pdf`, "_blank")}
                    >
                        Download PDF
                    </Button>
                    <Button variant="primary" onClick={() => navigate("/billing")}>
                        View All Bills
                    </Button>
                </div>
            </div>
        );
    }

    return (
        <div className="space-y-5 max-w-3xl">

            {/* Header */}
            <div className="flex items-center gap-3">
                <Button variant="ghost" size="sm" icon={ArrowLeft} onClick={() => navigate("/billing")}>
                    Back
                </Button>
                <div>
                    <h1 className="text-2xl font-bold text-slate-800">Generate Bill</h1>
                    <p className="text-sm text-slate-500">Create a new invoice for a patient</p>
                </div>
            </div>

            {error && (
                <div className="px-4 py-3 bg-red-50 border border-red-200 rounded-lg text-red-600 text-sm">{error}</div>
            )}

            {/* Patient & Appointment */}
            <div className="bg-white rounded-2xl border border-slate-100 shadow-sm p-5 space-y-4">
                <h2 className="text-sm font-semibold text-slate-700 border-b border-slate-100 pb-3">
                    Patient Information
                </h2>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                        <label className="block text-sm font-medium text-slate-700 mb-1.5">Patient</label>
                        {pLoading ? <Loader size="sm" /> : (
                            <select
                                value={selectedPatient}
                                onChange={(e) => setSelectedPatient(e.target.value)}
                                className="w-full px-3 py-2.5 rounded-lg border border-slate-200 text-sm text-slate-800 outline-none focus:ring-2 focus:ring-sky-500 bg-slate-50"
                            >
                                <option value="">Select patient</option>
                                {patientsData?.patients?.map((p) => (
                                    <option key={p._id} value={p._id}>
                                        {p.user?.name} — {p.patientId}
                                    </option>
                                ))}
                            </select>
                        )}
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-slate-700 mb-1.5">
                            Linked Appointment <span className="text-slate-400 font-normal">(optional)</span>
                        </label>
                        <select
                            value={selectedAppointment}
                            onChange={(e) => setSelectedAppointment(e.target.value)}
                            className="w-full px-3 py-2.5 rounded-lg border border-slate-200 text-sm text-slate-800 outline-none focus:ring-2 focus:ring-sky-500 bg-slate-50"
                        >
                            <option value="">No appointment</option>
                            {appointmentsData?.appointments
                                ?.filter((a) => !selectedPatient || a.patient?._id === selectedPatient)
                                .map((a) => (
                                    <option key={a._id} value={a._id}>
                                        {a.patient?.user?.name} — Dr. {a.doctor?.user?.name}
                                    </option>
                                ))}
                        </select>
                    </div>
                </div>
            </div>

            {/* Bill Items */}
            <div className="bg-white rounded-2xl border border-slate-100 shadow-sm p-5 space-y-4">
                <div className="flex items-center justify-between border-b border-slate-100 pb-3">
                    <h2 className="text-sm font-semibold text-slate-700">Charge Items</h2>
                    <Button variant="outline" size="sm" icon={Plus} onClick={addItem}>
                        Add Item
                    </Button>
                </div>

                <div className="space-y-3">
                    {items.map((item, index) => (
                        <div key={index} className="p-4 bg-slate-50 rounded-xl space-y-3">
                            <div className="flex items-center justify-between">
                                <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider">
                                    Item {index + 1}
                                </span>
                                {items.length > 1 && (
                                    <button
                                        type="button"
                                        onClick={() => removeItem(index)}
                                        className="p-1 rounded-lg hover:bg-red-50 text-slate-400 hover:text-red-500 transition-colors"
                                    >
                                        <Trash2 size={14} />
                                    </button>
                                )}
                            </div>
                            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                                <div className="sm:col-span-1">
                                    <label className="block text-xs text-slate-500 mb-1">Type</label>
                                    <select
                                        value={item.type}
                                        onChange={(e) => updateItem(index, "type", e.target.value)}
                                        className="w-full px-3 py-2 rounded-lg border border-slate-200 text-sm text-slate-800 outline-none focus:ring-2 focus:ring-sky-500 bg-white capitalize"
                                    >
                                        {ITEM_TYPES.map((t) => (
                                            <option key={t} value={t} className="capitalize">{t}</option>
                                        ))}
                                    </select>
                                </div>
                                <div className="sm:col-span-1">
                                    <label className="block text-xs text-slate-500 mb-1">Description</label>
                                    <input
                                        type="text"
                                        value={item.description}
                                        onChange={(e) => updateItem(index, "description", e.target.value)}
                                        placeholder="e.g. Consultation fee"
                                        className="w-full px-3 py-2 rounded-lg border border-slate-200 text-sm text-slate-800 outline-none focus:ring-2 focus:ring-sky-500 bg-white"
                                    />
                                </div>
                                <div>
                                    <label className="block text-xs text-slate-500 mb-1">Amount (₹)</label>
                                    <input
                                        type="number"
                                        min={0}
                                        value={item.amount}
                                        onChange={(e) => updateItem(index, "amount", e.target.value)}
                                        placeholder="500"
                                        className="w-full px-3 py-2 rounded-lg border border-slate-200 text-sm text-slate-800 outline-none focus:ring-2 focus:ring-sky-500 bg-white"
                                    />
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
            </div>

            {/* Payment Details */}
            <div className="bg-white rounded-2xl border border-slate-100 shadow-sm p-5 space-y-4">
                <h2 className="text-sm font-semibold text-slate-700 border-b border-slate-100 pb-3">
                    Payment Details
                </h2>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                        <label className="block text-sm font-medium text-slate-700 mb-2">Payment Mode</label>
                        <div className="flex flex-wrap gap-2">
                            {["cash", "card", "insurance", "online"].map((mode) => (
                                <button
                                    key={mode}
                                    type="button"
                                    onClick={() => setPaymentMode(mode)}
                                    className={`px-4 py-2 rounded-xl border text-sm font-medium capitalize transition-colors
                    ${paymentMode === mode
                                            ? "bg-sky-500 text-white border-sky-500"
                                            : "border-slate-200 text-slate-600 hover:bg-slate-50"}`}
                                >
                                    {mode}
                                </button>
                            ))}
                        </div>
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-slate-700 mb-2">Payment Status</label>
                        <div className="flex gap-2">
                            {["paid", "partial", "unpaid"].map((s) => (
                                <button
                                    key={s}
                                    type="button"
                                    onClick={() => setPaymentStatus(s)}
                                    className={`flex-1 py-2 rounded-xl border text-sm font-medium capitalize transition-colors
                    ${paymentStatus === s
                                            ? s === "paid"
                                                ? "bg-emerald-500 text-white border-emerald-500"
                                                : s === "partial"
                                                    ? "bg-amber-500 text-white border-amber-500"
                                                    : "bg-red-500 text-white border-red-500"
                                            : "border-slate-200 text-slate-600 hover:bg-slate-50"}`}
                                >
                                    {s}
                                </button>
                            ))}
                        </div>
                    </div>
                </div>

                <div className="max-w-xs">
                    <label className="block text-sm font-medium text-slate-700 mb-1.5">Discount (₹)</label>
                    <input
                        type="number"
                        min={0}
                        max={totalAmount}
                        value={discount}
                        onChange={(e) => setDiscount(e.target.value)}
                        placeholder="0"
                        className="w-full px-3 py-2.5 rounded-lg border border-slate-200 text-sm text-slate-800 outline-none focus:ring-2 focus:ring-sky-500 bg-slate-50"
                    />
                </div>

                {/* Amount Summary */}
                <div className="bg-slate-50 rounded-xl p-4 space-y-2">
                    <div className="flex justify-between text-sm text-slate-600">
                        <span>Subtotal</span>
                        <span>₹{totalAmount}</span>
                    </div>
                    {discount > 0 && (
                        <div className="flex justify-between text-sm text-emerald-600">
                            <span>Discount</span>
                            <span>-₹{discount}</span>
                        </div>
                    )}
                    <div className="flex justify-between text-base font-bold text-slate-800 border-t border-slate-200 pt-2">
                        <span>Total Payable</span>
                        <span>₹{finalAmount}</span>
                    </div>
                </div>
            </div>

            {/* Actions */}
            <div className="flex items-center gap-3 justify-end">
                <Button variant="outline" onClick={() => navigate("/billing")}>Cancel</Button>
                <Button
                    variant="primary"
                    icon={Receipt}
                    loading={submitting}
                    onClick={handleSubmit}
                >
                    Generate Bill
                </Button>
            </div>

        </div>
    );
};

export default GenerateBill;