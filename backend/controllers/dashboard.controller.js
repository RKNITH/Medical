import User from "../models/User.model.js";
import Patient from "../models/Patient.model.js";
import Doctor from "../models/Doctor.model.js";
import Appointment from "../models/Appointment.model.js";
import Bed from "../models/Bed.model.js";
import Bill from "../models/Bill.model.js";
import LabTest from "../models/LabTest.model.js";
import { successResponse, errorResponse } from "../utils/apiResponse.js";

// @GET /api/dashboard/stats
export const getDashboardStats = async (req, res) => {
    try {
        // BUG FIX: today's date was computed incorrectly.
        // setHours() mutates the same Date object, so startOfDay and endOfDay
        // both ended up pointing to 23:59:59. Fixed by creating separate Date objects.
        const now = new Date();
        const startOfDay = new Date(now.getFullYear(), now.getMonth(), now.getDate(), 0, 0, 0, 0);
        const endOfDay = new Date(now.getFullYear(), now.getMonth(), now.getDate(), 23, 59, 59, 999);

        // OPTIMIZATION: all 10 queries run concurrently with Promise.all
        const [
            totalPatients,
            totalDoctors,
            totalStaff,
            todayAppointments,
            pendingAppointments,
            availableBeds,
            occupiedBeds,
            pendingLabTests,
            todayRevenueResult,
            totalRevenueResult,
        ] = await Promise.all([
            Patient.countDocuments(),
            Doctor.countDocuments(),
            User.countDocuments({ role: { $in: ["nurse", "receptionist", "lab_technician", "pharmacist"] } }),
            Appointment.countDocuments({ appointmentDate: { $gte: startOfDay, $lte: endOfDay } }),
            Appointment.countDocuments({ status: "scheduled" }),
            Bed.countDocuments({ status: "available" }),
            Bed.countDocuments({ status: "occupied" }),
            LabTest.countDocuments({ status: { $in: ["pending", "sample_collected", "in_progress"] } }),
            Bill.aggregate([
                { $match: { paymentStatus: "paid", paidAt: { $gte: startOfDay, $lte: endOfDay } } },
                { $group: { _id: null, total: { $sum: "$finalAmount" } } },
            ]),
            Bill.aggregate([
                { $match: { paymentStatus: "paid" } },
                { $group: { _id: null, total: { $sum: "$finalAmount" } } },
            ]),
        ]);

        const totalBeds = availableBeds + occupiedBeds;

        return successResponse(res, "Dashboard stats fetched successfully.", {
            totalPatients,
            totalDoctors,
            totalStaff,
            todayAppointments,
            pendingAppointments,
            availableBeds,
            occupiedBeds,
            totalBeds,
            bedOccupancyRate: totalBeds > 0
                ? parseFloat(((occupiedBeds / totalBeds) * 100).toFixed(1))
                : 0,
            pendingLabTests,
            todayRevenue: todayRevenueResult[0]?.total || 0,
            totalRevenue: totalRevenueResult[0]?.total || 0,
        });
    } catch (error) {
        return errorResponse(res, error.message);
    }
};

// @GET /api/dashboard/recent-appointments
export const getRecentAppointments = async (req, res) => {
    try {
        const appointments = await Appointment.find()
            .populate({ path: "patient", populate: { path: "user", select: "name" } })
            .populate({ path: "doctor", populate: { path: "user", select: "name" } })
            .sort({ createdAt: -1 })
            .limit(10)
            .lean();   // OPTIMIZATION: lean() — no need for Mongoose documents here

        return successResponse(res, "Recent appointments fetched.", appointments);
    } catch (error) {
        return errorResponse(res, error.message);
    }
};

// @GET /api/dashboard/revenue-chart
export const getRevenueChart = async (req, res) => {
    try {
        const last7Days = await Bill.aggregate([
            {
                $match: {
                    paymentStatus: "paid",
                    paidAt: { $gte: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000) },
                },
            },
            {
                $group: {
                    _id: { $dateToString: { format: "%Y-%m-%d", date: "$paidAt" } },
                    revenue: { $sum: "$finalAmount" },
                    count: { $sum: 1 },
                },
            },
            { $sort: { _id: 1 } },
        ]);

        return successResponse(res, "Revenue chart data fetched.", last7Days);
    } catch (error) {
        return errorResponse(res, error.message);
    }
};

// @GET /api/dashboard/appointment-chart
export const getAppointmentChart = async (req, res) => {
    try {
        const data = await Appointment.aggregate([
            {
                $match: {
                    appointmentDate: { $gte: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000) },
                },
            },
            {
                $group: {
                    _id: { $dateToString: { format: "%Y-%m-%d", date: "$appointmentDate" } },
                    count: { $sum: 1 },
                },
            },
            { $sort: { _id: 1 } },
        ]);

        return successResponse(res, "Appointment chart data fetched.", data);
    } catch (error) {
        return errorResponse(res, error.message);
    }
};
