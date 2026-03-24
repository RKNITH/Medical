import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useSelector } from "react-redux";
import api from "../../api/axios.js";
import useFetch from "../../hooks/useFetch.js";
import { ArrowLeft, Pill, Plus, Trash2, CheckCircle } from "lucide-react";
import Button from "../../components/common/Button.jsx";
import Loader from "../../components/common/Loader.jsx";

const DispenseMedicine = () => {
    const navigate = useNavigate();
    const { user } = useSelector((state) => state.auth);

    const { data: patientsData, loading: pLoading } = useFetch("/patients", { limit: 100 });
    const { data: medicinesData, loading: mLoading } = useFetch("/pharmacy", { limit: 100 });

    const [selectedPatient, setSelectedPatient] = useState("");
    const [items, setItems] = useState([{ medicineId: "", medicineName: "", quantity: 1, price: 0 }]);
    const [submitting, setSubmitting] = useState(false);
    const [error, setError] = useState(null);
    const [success, setSuccess] = useState(false);
    const [paymentMode, setPaymentMode] = useState("cash");

    const handleMedicineChange = (index, medicineId) => {
        const med = medicinesData?.medicines?.find((m) => m._id === medicineId);
        const updated = [...items];
        updated[index] = {
            ...updated[index],
            medicineId,
            medicineName: med?.name || "",
            price: med?.price || 0,
        };
        setItems(updated);
    };

    const handleQtyChange = (index, qty) => {
        const updated = [...items];
        updated[index].quantity = Number(qty);
        setItems(updated);
    };

    const addItem = () => {
        setItems([...items, { medicineId: "", medicineName: "", quantity: 1, price: 0 }]);
    };

    const removeItem = (index) => {
        setItems(items.filter((_, i) => i !== index));
    };

    const totalAmount = items.reduce((sum, item) => sum + item.price * item.quantity, 0);

    const handleDispense = async () => {
        if (!selectedPatient) { setError("Please select a patient."); return; }
        if (items.some((i) => !i.medicineId)) { setError("Please select medicine for all items."); return; }

        setSubmitting(true);
        setError(null);
        try {
            // Deduct stock for each medicine
            for (const item of items) {
                await api.put(`/pharmacy/${item.medicineId}/stock`, {
                    quantity: item.quantity,
                    action: "deduct",
                });
            }

            // Create bill
            await api.post("/billing", {
                patient: selectedPatient,
                items: items.map((item) => ({
                    description: `${item.medicineName} x${item.quantity}`,
                    type: "pharmacy",
                    amount: item.price * item.quantity,
                })),
                totalAmount,
                finalAmount: totalAmount,
                discount: 0,
                paymentMode,
                paymentStatus: "paid",
                generatedBy: user._id,
            });

            setSuccess(true);
        } catch (err) {
            setError(err.response?.data?.message || "Failed to dispense medicines.");
        } finally {
            setSubmitting(false);
        }
    };

    if (success) {
        return (
            <div className="max-w-lg mx-auto mt-20 flex flex-col items-center gap-4 text-center">
                <div className="w-16 h-16 rounded-2xl bg-emerald-50 flex items-center justify-center">
                    <CheckCircle size={32} className="text-emerald-500" />
                </div>
                <h2 className="text-xl font-bold text-slate-800">Medicines Dispensed!</h2>
                <p className="text-sm text-slate-500">
                    Stock has been updated and a bill of{" "}
                    <span className="font-semibold text-slate-700">₹{totalAmount}</span> has been generated.
                </p>
                <div className="flex gap-3 mt-2">
                    <Button variant="outline" onClick={() => { setSuccess(false); setItems([{ medicineId: "", medicineName: "", quantity: 1, price: 0 }]); setSelectedPatient(""); }}>
                        New Dispense
                    </Button>
                    <Button variant="primary" onClick={() => navigate("/pharmacy")}>
                        Back to Inventory
                    </Button>
                </div>
            </div>
        );
    }

    return (
        <div className="space-y-5 max-w-3xl">

            {/* Header */}
            <div className="flex items-center gap-3">
                <Button variant="ghost" size="sm" icon={ArrowLeft} onClick={() => navigate("/pharmacy")}>
                    Back
                </Button>
                <div>
                    <h1 className="text-2xl font-bold text-slate-800">Dispense Medicine</h1>
                    <p className="text-sm text-slate-500">Issue medicines to a patient</p>
                </div>
            </div>

            {error && (
                <div className="px-4 py-3 bg-red-50 border border-red-200 rounded-lg text-red-600 text-sm">{error}</div>
            )}

            {/* Patient Select */}
            <div className="bg-white rounded-2xl border border-slate-100 shadow-sm p-5 space-y-3">
                <h2 className="text-sm font-semibold text-slate-700 border-b border-slate-100 pb-3">
                    Select Patient
                </h2>
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

            {/* Medicine Items */}
            <div className="bg-white rounded-2xl border border-slate-100 shadow-sm p-5 space-y-4">
                <div className="flex items-center justify-between border-b border-slate-100 pb-3">
                    <h2 className="text-sm font-semibold text-slate-700">Medicines</h2>
                    <Button variant="outline" size="sm" icon={Plus} onClick={addItem}>
                        Add Item
                    </Button>
                </div>

                {mLoading ? <Loader /> : (
                    <div className="space-y-3">
                        {items.map((item, index) => {
                            const med = medicinesData?.medicines?.find((m) => m._id === item.medicineId);
                            return (
                                <div key={index} className="p-4 bg-slate-50 rounded-xl space-y-3">
                                    <div className="flex items-center justify-between">
                                        <div className="flex items-center gap-2">
                                            <Pill size={15} className="text-emerald-500" />
                                            <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider">
                                                Item {index + 1}
                                            </span>
                                        </div>
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
                                        <div className="sm:col-span-2">
                                            <label className="block text-xs text-slate-500 mb-1">Medicine</label>
                                            <select
                                                value={item.medicineId}
                                                onChange={(e) => handleMedicineChange(index, e.target.value)}
                                                className="w-full px-3 py-2 rounded-lg border border-slate-200 text-sm text-slate-800 outline-none focus:ring-2 focus:ring-sky-500 bg-white"
                                            >
                                                <option value="">Select medicine</option>
                                                {medicinesData?.medicines?.filter((m) => m.isAvailable).map((m) => (
                                                    <option key={m._id} value={m._id}>
                                                        {m.name} ({m.unit}) — {m.stock} left
                                                    </option>
                                                ))}
                                            </select>
                                        </div>
                                        <div>
                                            <label className="block text-xs text-slate-500 mb-1">Quantity</label>
                                            <input
                                                type="number"
                                                min={1}
                                                max={med?.stock || 1}
                                                value={item.quantity}
                                                onChange={(e) => handleQtyChange(index, e.target.value)}
                                                className="w-full px-3 py-2 rounded-lg border border-slate-200 text-sm text-slate-800 outline-none focus:ring-2 focus:ring-sky-500 bg-white"
                                            />
                                        </div>
                                    </div>

                                    {item.medicineId && (
                                        <div className="flex items-center justify-between text-xs text-slate-500">
                                            <span>Unit Price: <span className="font-semibold text-slate-700">₹{item.price}</span></span>
                                            <span>Subtotal: <span className="font-semibold text-slate-700">₹{item.price * item.quantity}</span></span>
                                            {med && (
                                                <span className={med.stock < item.quantity ? "text-red-500 font-medium" : "text-slate-400"}>
                                                    {med.stock} in stock
                                                </span>
                                            )}
                                        </div>
                                    )}
                                </div>
                            );
                        })}
                    </div>
                )}
            </div>

            {/* Payment & Summary */}
            <div className="bg-white rounded-2xl border border-slate-100 shadow-sm p-5 space-y-4">
                <h2 className="text-sm font-semibold text-slate-700 border-b border-slate-100 pb-3">
                    Payment
                </h2>
                <div>
                    <label className="block text-sm font-medium text-slate-700 mb-1.5">Payment Mode</label>
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
                <div className="flex items-center justify-between p-4 bg-slate-50 rounded-xl">
                    <span className="text-sm font-medium text-slate-600">Total Amount</span>
                    <span className="text-2xl font-bold text-slate-800">₹{totalAmount}</span>
                </div>
            </div>

            {/* Actions */}
            <div className="flex items-center gap-3 justify-end">
                <Button variant="outline" onClick={() => navigate("/pharmacy")}>Cancel</Button>
                <Button
                    variant="primary"
                    loading={submitting}
                    disabled={!selectedPatient || items.some((i) => !i.medicineId)}
                    onClick={handleDispense}
                >
                    Dispense & Generate Bill
                </Button>
            </div>

        </div>
    );
};

export default DispenseMedicine;