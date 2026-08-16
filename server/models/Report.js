const mongoose = require("mongoose");

const reportSchema = new mongoose.Schema({
    // ADMIN --generates--> REPORT
    adminId: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
    totalUsers: { type: Number, default: 0 },
    totalDonations: { type: Number, default: 0 },
    completedPickups: { type: Number, default: 0 },
    generatedDate: { type: Date, default: Date.now },
});

module.exports = mongoose.model("Report", reportSchema);