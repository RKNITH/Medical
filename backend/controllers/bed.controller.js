import Bed from "../models/Bed.model.js";
import { successResponse, errorResponse } from "../utils/apiResponse.js";

// @POST /api/beds
export const createBed = async (req, res) => {
    try {
        const { bedNumber, ward, type, pricePerDay } = req.body;
        if (!bedNumber || !ward) return errorResponse(res, "bedNumber and ward are required.", 400);

        const existing = await Bed.findOne({ bedNumber }).lean();
        if (existing) return errorResponse(res, "Bed number already exists.", 400);

        const bed = await Bed.create({ bedNumber, ward, type, pricePerDay });
        return successResponse(res, "Bed created successfully.", bed, 201);
    } catch (error) {
        return errorResponse(res, error.message);
    }
};

// @GET /api/beds
export const getAllBeds = async (req, res) => {
    try {
        const { status, type, ward } = req.query;

        const filter = {};
        if (status) filter.status = status;
        if (type) filter.type = type;
        if (ward) filter.ward = { $regex: ward, $options: "i" };

        const beds = await Bed.find(filter)
            .populate({ path: "assignedPatient", populate: { path: "user", select: "name" } })
            .sort({ bedNumber: 1 })
            .lean();

        return successResponse(res, "Beds fetched successfully.", beds);
    } catch (error) {
        return errorResponse(res, error.message);
    }
};

// @GET /api/beds/:id
export const getBedById = async (req, res) => {
    try {
        const bed = await Bed.findById(req.params.id)
            .populate({ path: "assignedPatient", populate: { path: "user", select: "name" } })
            .lean();

        if (!bed) return errorResponse(res, "Bed not found.", 404);
        return successResponse(res, "Bed fetched successfully.", bed);
    } catch (error) {
        return errorResponse(res, error.message);
    }
};

// @PUT /api/beds/:id
export const updateBed = async (req, res) => {
    try {
        // BUG FIX: original passed req.body directly into update — an attacker
        // could inject arbitrary fields (e.g. set bedNumber to an existing one
        // to create a collision). Whitelist allowed fields.
        const { ward, type, pricePerDay, status, assignedPatient } = req.body;
        const updateFields = {};
        if (ward !== undefined) updateFields.ward = ward;
        if (type !== undefined) updateFields.type = type;
        if (pricePerDay !== undefined) updateFields.pricePerDay = pricePerDay;
        if (status !== undefined) updateFields.status = status;
        if (assignedPatient !== undefined) updateFields.assignedPatient = assignedPatient;

        const bed = await Bed.findByIdAndUpdate(req.params.id, updateFields, { new: true, runValidators: true })
            .populate({ path: "assignedPatient", populate: { path: "user", select: "name" } })
            .lean();

        if (!bed) return errorResponse(res, "Bed not found.", 404);
        return successResponse(res, "Bed updated successfully.", bed);
    } catch (error) {
        return errorResponse(res, error.message);
    }
};

// @DELETE /api/beds/:id
export const deleteBed = async (req, res) => {
    try {
        const bed = await Bed.findById(req.params.id).lean();
        if (!bed) return errorResponse(res, "Bed not found.", 404);
        if (bed.status === "occupied") return errorResponse(res, "Cannot delete an occupied bed.", 400);

        await Bed.findByIdAndDelete(req.params.id);
        return successResponse(res, "Bed deleted successfully.");
    } catch (error) {
        return errorResponse(res, error.message);
    }
};
