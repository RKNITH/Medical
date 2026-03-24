import dotenv from "dotenv";
import mongoose from "mongoose";
import bcrypt from "bcryptjs";
import User from "./models/User.model.js";

dotenv.config();

const seed = async () => {
    try {
        await mongoose.connect(process.env.MONGO_URI);
        console.log("MongoDB Connected...");

        // Check if super admin already exists
        const existing = await User.findOne({ role: "super_admin" });
        if (existing) {
            console.log("Super Admin already exists!");
            console.log(`Email   : ${existing.email}`);
            console.log("Password: (use the one you set)");
            process.exit(0);
        }

        // Create Super Admin
        const hashedPassword = await bcrypt.hash("Ravi@1234", 12);

        const superAdmin = await User.create({
            name: "Raviranjan Kumar",
            email: "198038@nith.ac.in",
            password: hashedPassword,
            role: "super_admin",
            phone: "+91-7973002267",
            isActive: true,
        });

        console.log("✅ Super Admin created successfully!");
        console.log("─────────────────────────────────");
        console.log(`Name    : ${superAdmin.name}`);
        console.log(`Email   : ${superAdmin.email}`);
        console.log(`Password: Ravi@1234`);
        console.log(`Role    : ${superAdmin.role}`);
        console.log("─────────────────────────────────");
        console.log("Login at: http://localhost:5173/login");
        console.log("⚠️  Please change the password after first login!");

        process.exit(0);
    } catch (error) {
        console.error("Seed Error:", error.message);
        process.exit(1);
    }
};

seed();