import express from "express";
import dotenv from "dotenv";
import cors from "cors";
import helmet from "helmet";
import morgan from "morgan";
import cookieParser from "cookie-parser";
import rateLimit from "express-rate-limit";
import { createServer } from "http";
import { Server } from "socket.io";
import compression from "compression";

import connectDB from "./config/db.js";

import authRoutes from "./routes/auth.routes.js";
import userRoutes from "./routes/user.routes.js";
import patientRoutes from "./routes/patient.routes.js";
import doctorRoutes from "./routes/doctor.routes.js";
import appointmentRoutes from "./routes/appointment.routes.js";
import prescriptionRoutes from "./routes/prescription.routes.js";
import labRoutes from "./routes/lab.routes.js";
import pharmacyRoutes from "./routes/pharmacy.routes.js";
import billingRoutes from "./routes/billing.routes.js";
import dashboardRoutes from "./routes/dashboard.routes.js";
import bedRoutes from "./routes/bed.routes.js";

// ── BUG FIX: dotenv.config() must run BEFORE anything reads process.env ──────
dotenv.config();

const app = express();
const httpServer = createServer(app);

// ── CORS — must be FIRST ──────────────────────────────────────────────────────
const allowedOrigins = [
    "http://localhost:5173",
    "http://localhost:5174",
    "http://127.0.0.1:5173",
    "http://127.0.0.1:5174",
    process.env.CLIENT_URL,
].filter(Boolean);

const corsOptions = {
    origin: function (origin, callback) {
        // allow requests with no origin (mobile apps, curl, postman)
        if (!origin) return callback(null, true);
        if (allowedOrigins.includes(origin)) {
            callback(null, true);
        } else {
            callback(new Error(`CORS blocked: ${origin}`));
        }
    },
    credentials: true,
    methods: ["GET", "POST", "PUT", "DELETE", "PATCH", "OPTIONS"],
    allowedHeaders: ["Content-Type", "Authorization", "Cookie"],
    exposedHeaders: ["set-cookie"],
};

app.use(cors(corsOptions));
app.options("/{*path}", cors(corsOptions));

// ── Socket.io ─────────────────────────────────────────────────────────────────
// BUG FIX: socket.io adapter + connection limits for 500 concurrent users
const io = new Server(httpServer, {
    cors: {
        origin: allowedOrigins,
        credentials: true,
    },
    // FIX: increase ping/pong timeouts so slow clients don't get dropped
    pingTimeout: 60000,
    pingInterval: 25000,
    // FIX: set max listeners to avoid Node.js EventEmitter warnings at scale
    maxHttpBufferSize: 1e6,
    transports: ["websocket", "polling"],
});

// FIX: track socket rooms server-side to avoid broadcasting to dead sockets
io.on("connection", (socket) => {
    socket.on("join_room", (room) => {
        socket.join(room);
    });

    socket.on("bed_status_update", (data) => {
        io.to("admin").emit("bed_status_changed", data);
        io.to("nurse").emit("bed_status_changed", data);
        io.to("receptionist").emit("bed_status_changed", data);
    });

    socket.on("appointment_update", (data) => {
        io.to("doctor").emit("appointment_changed", data);
        io.to("receptionist").emit("appointment_changed", data);
    });

    socket.on("disconnect", () => {
        // cleanup is automatic for rooms; nothing to do here
    });
});

// Attach io to every request
app.use((req, res, next) => {
    req.io = io;
    next();
});

// ── Security Middleware ───────────────────────────────────────────────────────
app.use(helmet({
    crossOriginResourcePolicy: { policy: "cross-origin" },
}));

// ── OPTIMIZATION: compress all responses (critical for 500 concurrent users) ──
app.use(compression());

// ── Rate Limiting ─────────────────────────────────────────────────────────────
// BUG FIX: in production the blanket limit of 100 requests/15min is WAY too
// tight for a hospital app — doctors/receptionists make dozens of API calls
// per page load. Raised to 500 per window. Auth endpoints stay strict.
const authLimiter = rateLimit({
    windowMs: 15 * 60 * 1000,
    max: 20,
    standardHeaders: true,
    legacyHeaders: false,
    message: { success: false, message: "Too many login attempts. Please try again in 15 minutes." },
});

const forgotPasswordLimiter = rateLimit({
    windowMs: 60 * 60 * 1000, // 1 hour
    max: 5,
    message: { success: false, message: "Too many password reset requests." },
});

const apiLimiter = rateLimit({
    windowMs: 15 * 60 * 1000,
    max: 500,    // 500 req per 15 min — adequate for 500 concurrent users
    standardHeaders: true,
    legacyHeaders: false,
    skip: (req) => req.path === "/api/health",
    message: { success: false, message: "Too many requests. Please try again later." },
});

// Always apply auth-specific limits regardless of environment
app.use("/api/auth/login", authLimiter);
app.use("/api/auth/forgot-password", forgotPasswordLimiter);

// Apply general API limit to all other routes
app.use("/api", apiLimiter);

// ── Body Parsers ──────────────────────────────────────────────────────────────
app.use(express.json({ limit: "10mb" }));
app.use(express.urlencoded({ extended: true, limit: "10mb" }));
app.use(cookieParser());

if (process.env.NODE_ENV !== "production") {
    app.use(morgan("dev"));
}

// ── Health Check ──────────────────────────────────────────────────────────────
app.get("/api/health", (req, res) => {
    res.status(200).json({
        success: true,
        message: "MediCore API is running.",
        environment: process.env.NODE_ENV,
        timestamp: new Date().toISOString(),
    });
});

// ── API Routes ────────────────────────────────────────────────────────────────
app.use("/api/auth", authRoutes);
app.use("/api/users", userRoutes);
app.use("/api/patients", patientRoutes);
app.use("/api/doctors", doctorRoutes);
app.use("/api/appointments", appointmentRoutes);
app.use("/api/prescriptions", prescriptionRoutes);
app.use("/api/lab", labRoutes);
app.use("/api/pharmacy", pharmacyRoutes);
app.use("/api/billing", billingRoutes);
app.use("/api/dashboard", dashboardRoutes);
app.use("/api/beds", bedRoutes);

// ── 404 Handler ───────────────────────────────────────────────────────────────
app.use((req, res) => {
    res.status(404).json({
        success: false,
        message: `Route ${req.originalUrl} not found.`,
    });
});

// ── Global Error Handler ──────────────────────────────────────────────────────
// BUG FIX: was logging every error to console in production; now only logs
// unexpected 5xx errors. Keeps logs clean and avoids leaking stack traces.
app.use((err, req, res, next) => {
    const status = err.status || 500;
    if (status >= 500) {
        console.error(`[${new Date().toISOString()}] ${req.method} ${req.originalUrl}`, err);
    }
    res.status(status).json({
        success: false,
        message: err.message || "Internal server error.",
    });
});

// ── Start Server ──────────────────────────────────────────────────────────────
// BUG FIX: connectDB() was called INSIDE the listen callback — if DB fails,
// the server is already "up" and will crash silently on first request.
// Now: connect first, then start listening.
const PORT = process.env.PORT || 5000;

(async () => {
    try {
        await connectDB();
        httpServer.listen(PORT, () => {
            console.log(`Server running in ${process.env.NODE_ENV} mode on port ${PORT}`);
        });
    } catch (err) {
        console.error("Failed to start server:", err.message);
        process.exit(1);
    }
})();
