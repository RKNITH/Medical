import Bill from "../models/Bill.model.js";
import Patient from "../models/Patient.model.js";
import { successResponse, errorResponse } from "../utils/apiResponse.js";
import { generateBillPDF } from "../utils/generatePDF.js";

// BUG FIX: original generateBillNo used Date.now().toString().slice(-8) —
// this produces only 8 digits, which collides across concurrent requests since
// Date.now() can return the same millisecond for parallel requests.
const generateBillNo = () =>
    `BILL-${Date.now().toString().slice(-8)}-${Math.random().toString(36).slice(-3).toUpperCase()}`;

// @POST /api/billing
export const createBill = async (req, res) => {
    try {
        const { patient, appointment, items, discount = 0, paymentMode, paymentStatus } = req.body;

        if (!patient || !items || !Array.isArray(items) || items.length === 0) {
            return errorResponse(res, "patient and items[] are required.", 400);
        }

        // BUG FIX: no validation that item.amount is a number — NaN would corrupt
        // totalAmount silently.
        const totalAmount = items.reduce((sum, item) => {
            const amt = Number(item.amount);
            if (isNaN(amt)) throw new Error(`Invalid amount for item: ${item.description}`);
            return sum + amt;
        }, 0);

        const discountAmt = Number(discount) || 0;
        const finalAmount = Math.max(0, totalAmount - discountAmt); // can't be negative

        const bill = await Bill.create({
            billNo: generateBillNo(),
            patient,
            appointment,
            items,
            totalAmount,
            discount: discountAmt,
            finalAmount,
            paymentMode,
            paymentStatus,
            paidAt: paymentStatus === "paid" ? new Date() : null,
            generatedBy: req.user._id,
        });

        const populated = await Bill.findById(bill._id)
            .populate({ path: "patient", populate: { path: "user", select: "name email phone" } })
            .populate("generatedBy", "name")
            .lean();

        req.io.to("patient").emit("bill_generated", {
            message: `A new bill of ₹${finalAmount} (${bill.billNo}) has been generated for you.`,
            type: "info",
        });
        req.io.to("admin").emit("bill_generated", {
            message: `Bill ${bill.billNo} generated for ${populated.patient?.user?.name} — ₹${finalAmount}`,
            type: "info",
        });

        return successResponse(res, "Bill created successfully.", populated, 201);
    } catch (error) {
        return errorResponse(res, error.message);
    }
};

// @GET /api/billing
export const getAllBills = async (req, res) => {
    try {
        const { paymentStatus, paymentMode, patient, page = 1, limit = 10 } = req.query;
        const pageNum = Math.max(1, parseInt(page, 10));
        const limitNum = Math.min(100, Math.max(1, parseInt(limit, 10)));
        const skip = (pageNum - 1) * limitNum;

        const filter = {};
        if (paymentStatus) filter.paymentStatus = paymentStatus;
        if (paymentMode) filter.paymentMode = paymentMode;
        if (patient) filter.patient = patient;

        // OPTIMIZATION: parallel count + find
        const [total, bills] = await Promise.all([
            Bill.countDocuments(filter),
            Bill.find(filter)
                .populate({ path: "patient", populate: { path: "user", select: "name email phone" } })
                .populate("generatedBy", "name")
                .skip(skip)
                .limit(limitNum)
                .sort({ createdAt: -1 })
                .lean(),
        ]);

        return successResponse(res, "Bills fetched successfully.", { total, page: pageNum, bills });
    } catch (error) {
        return errorResponse(res, error.message);
    }
};

// @GET /api/billing/:id
export const getBillById = async (req, res) => {
    try {
        const bill = await Bill.findById(req.params.id)
            .populate({ path: "patient", populate: { path: "user", select: "name email phone" } })
            .populate("appointment")
            .populate("generatedBy", "name")
            .lean();

        if (!bill) return errorResponse(res, "Bill not found.", 404);
        return successResponse(res, "Bill fetched successfully.", bill);
    } catch (error) {
        return errorResponse(res, error.message);
    }
};

// @GET /api/billing/patient/:patientId
export const getPatientBills = async (req, res) => {
    try {
        if (req.user.role === "patient") {
            const own = await Patient.findOne({ user: req.user._id }).select("_id").lean();
            if (!own || own._id.toString() !== req.params.patientId) {
                return errorResponse(res, "Access denied.", 403);
            }
        }

        const bills = await Bill.find({ patient: req.params.patientId })
            .populate("generatedBy", "name")
            .sort({ createdAt: -1 })
            .lean();

        return successResponse(res, "Patient bills fetched successfully.", bills);
    } catch (error) {
        return errorResponse(res, error.message);
    }
};

// @PUT /api/billing/:id/payment
export const updatePaymentStatus = async (req, res) => {
    try {
        const { paymentStatus, paymentMode } = req.body;

        const allowedStatuses = ["pending", "paid", "partial", "cancelled"];
        if (!paymentStatus || !allowedStatuses.includes(paymentStatus)) {
            return errorResponse(res, `paymentStatus must be one of: ${allowedStatuses.join(", ")}`, 400);
        }

        const bill = await Bill.findByIdAndUpdate(
            req.params.id,
            {
                paymentStatus,
                paymentMode,
                paidAt: paymentStatus === "paid" ? new Date() : null,
            },
            { new: true }
        )
            .populate({ path: "patient", populate: { path: "user", select: "name" } })
            .lean();

        if (!bill) return errorResponse(res, "Bill not found.", 404);

        if (paymentStatus === "paid") {
            req.io.to("patient").emit("bill_generated", {
                message: `Payment of ₹${bill.finalAmount} for bill ${bill.billNo} confirmed. Thank you!`,
                type: "success",
            });
        }

        return successResponse(res, "Payment status updated.", bill);
    } catch (error) {
        return errorResponse(res, error.message);
    }
};

// @GET /api/billing/:id/pdf
export const downloadBillPDF = async (req, res) => {
    try {
        const bill = await Bill.findById(req.params.id)
            .populate({ path: "patient", populate: { path: "user", select: "name" } })
            .lean();

        if (!bill) return errorResponse(res, "Bill not found.", 404);

        const data = {
            patient: { name: bill.patient?.user?.name },
            billNo: bill.billNo,
            items: bill.items,
            totalAmount: bill.finalAmount,
            paymentMode: bill.paymentMode,
            date: new Date(bill.createdAt).toDateString(),
        };

        generateBillPDF(res, data);
    } catch (error) {
        return errorResponse(res, error.message);
    }
};
