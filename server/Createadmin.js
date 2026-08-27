// One-time script to create your first Admin account.
// Run with: node createAdmin.js   (from inside server/)
// Admins can't self-register through /api/auth/register on purpose —
// this script is the one-time exception. Safe to delete after running once.

require("dotenv").config();
const mongoose = require("mongoose");
const bcrypt = require("bcryptjs");
const connectDB = require("./config/db");
const Admin = require("./models/Admin");

const run = async () => {
    await connectDB();

    const email = "admin@mealmitra.com";
    const plainPassword = "Admin@123";

    const existing = await Admin.findOne({ email });
    if (existing) {
        console.log("Admin already exists with this email. Nothing created.");
        await mongoose.connection.close();
        process.exit(0);
    }

    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(plainPassword, salt);

    const admin = await Admin.create({
        name: "System Admin",
        email,
        password: hashedPassword,
        verificationStatus: "Verified", // Admins don't need approval — set directly
    });

    console.log("✅ Admin account created successfully:");
    console.log("   email:", admin.email);
    console.log("   password:", plainPassword, "(save this, it won't be shown again)");
    console.log("\nLogin with this at POST /api/auth/login to get an Admin token.");

    await mongoose.connection.close();
    process.exit(0);
};

run().catch((err) => {
    console.error("Failed to create admin:", err.message);
    process.exit(1);
});