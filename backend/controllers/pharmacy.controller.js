import Medicine from "../models/Medicine.model.js";
import { successResponse, errorResponse } from "../utils/apiResponse.js";

// @POST /api/pharmacy
export const addMedicine = async (req, res) => {
    try {
        const { name, genericName, category, manufacturer, stock, unit, price, expiryDate, batchNumber, reorderLevel } = req.body;

        const medicine = await Medicine.create({ name, genericName, category, manufacturer, stock, unit, price, expiryDate, batchNumber, reorderLevel });
        return successResponse(res, "Medicine added successfully.", medicine, 201);
    } catch (error) {
        return errorResponse(res, error.message);
    }
};

// @GET /api/pharmacy
export const getAllMedicines = async (req, res) => {
    try {
        const { search, category, isAvailable, lowStock, page = 1, limit = 10 } = req.query;
        const skip = (page - 1) * limit;

        const filter = {};
        if (search) filter.name = { $regex: search, $options: "i" };
        if (category) filter.category = category;
        if (isAvailable !== undefined) filter.isAvailable = isAvailable === "true";
        if (lowStock === "true") filter.$expr = { $lte: ["$stock", "$reorderLevel"] };

        const total = await Medicine.countDocuments(filter);
        const medicines = await Medicine.find(filter).skip(skip).limit(Number(limit)).sort({ createdAt: -1 });

        return successResponse(res, "Medicines fetched successfully.", { total, page: Number(page), medicines });
    } catch (error) {
        return errorResponse(res, error.message);
    }
};

// @GET /api/pharmacy/:id
export const getMedicineById = async (req, res) => {
    try {
        const medicine = await Medicine.findById(req.params.id);
        if (!medicine) return errorResponse(res, "Medicine not found.", 404);
        return successResponse(res, "Medicine fetched successfully.", medicine);
    } catch (error) {
        return errorResponse(res, error.message);
    }
};

// @PUT /api/pharmacy/:id
export const updateMedicine = async (req, res) => {
    try {
        const medicine = await Medicine.findByIdAndUpdate(req.params.id, req.body, { new: true, runValidators: true });
        if (!medicine) return errorResponse(res, "Medicine not found.", 404);
        return successResponse(res, "Medicine updated successfully.", medicine);
    } catch (error) {
        return errorResponse(res, error.message);
    }
};

// @PUT /api/pharmacy/:id/stock
export const updateStock = async (req, res) => {
    try {
        const { quantity, action } = req.body; // action: "add" | "deduct"

        // BUG FIX: validate quantity is a positive integer
        const qty = parseInt(quantity, 10);
        if (isNaN(qty) || qty <= 0) {
            return errorResponse(res, "quantity must be a positive integer.", 400);
        }
        if (!["add", "deduct"].includes(action)) {
            return errorResponse(res, 'action must be "add" or "deduct".', 400);
        }

        const medicine = await Medicine.findById(req.params.id);
        if (!medicine) return errorResponse(res, "Medicine not found.", 404);

        if (action === "add") {
            medicine.stock += qty;
        } else if (action === "deduct") {
            if (medicine.stock < qty) return errorResponse(res, "Insufficient stock.", 400);
            medicine.stock -= qty;
        }

        medicine.isAvailable = medicine.stock > 0;
        await medicine.save();

        return successResponse(res, "Stock updated successfully.", medicine);
    } catch (error) {
        return errorResponse(res, error.message);
    }
};

// @DELETE /api/pharmacy/:id
export const deleteMedicine = async (req, res) => {
    try {
        const medicine = await Medicine.findByIdAndDelete(req.params.id);
        if (!medicine) return errorResponse(res, "Medicine not found.", 404);
        return successResponse(res, "Medicine deleted successfully.");
    } catch (error) {
        return errorResponse(res, error.message);
    }
};