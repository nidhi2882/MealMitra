const express = require("express");
const router = express.Router();

const {
    getHistory,
    getUserHistory,
    generateCertificatePDF,
} = require("../controllers/HistoryController");
const { protect } = require("../middleware/Authmiddleware");

// Authenticated — role-based own history
router.get("/", protect, getHistory);

// Download official donation / handover certificate PDF
router.get("/:id/certificate", protect, generateCertificatePDF);

// Admin or the user themself — history for a specific user
router.get("/:userId", protect, getUserHistory);

module.exports = router;