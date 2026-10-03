// Entry point for MealMitra backend
require("dotenv").config();
const express = require("express");
const cors = require("cors");
const connectDB = require("./config/db");

const authRoutes = require("./routes/Authroutes");
const adminRoutes = require("./routes/AdminRoutes");
const donationRoutes = require("./routes/DonationRoutes");
const pickupRoutes = require("./routes/PickupRoutes");
const historyRoutes = require("./routes/HistoryRoutes");
const notificationRoutes = require("./routes/NotificationRoutes");
const { errorHandler, notFound } = require("./middleware/errorMiddleware");

const app = express();
app.use(cors());
app.use(express.json());

connectDB();

app.get("/", (req, res) => res.send("MealMitra API is running..."));

app.use("/api/auth", authRoutes);
app.use("/api/admin", adminRoutes);
app.use("/api/donations", donationRoutes);
app.use("/api/pickups", pickupRoutes);
app.use("/api/history", historyRoutes);
app.use("/api/notifications", notificationRoutes);

// Fallback for 404 routes
app.use(notFound);

// Global Error Handler (must be last)
app.use(errorHandler);

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));