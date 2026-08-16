const mongoose = require("mongoose");

const notificationSchema = new mongoose.Schema({
    // USER --receives--> NOTIFICATION
    userId: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
    message: { type: String, required: true },
    dateTime: { type: Date, default: Date.now },
    isRead: { type: Boolean, default: false },
});

module.exports = mongoose.model("Notification", notificationSchema);