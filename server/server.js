// Entry point for MealMitra backend
require("dotenv").config();
const express = require("express");
const cors = require("cors");
const connectDB = require("./config/db");

const authRoutes = require("./routes/authRoutes");
const adminRoutes = require("./routes/adminRoutes");
const donationRoutes = require("./routes/DonationRoutes");
const pickupRoutes = require("./routes/PickupRoutes");

const app = express();
app.use(cors());
app.use(express.json());

connectDB();

app.get("/", (req, res) => res.send("MealMitra API is running..."));

app.use("/api/auth", authRoutes);
app.use("/api/admin", adminRoutes);
app.use("/api/donation",donationRoutes);
app.use("/api/pickups", pickupRoutes);

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));