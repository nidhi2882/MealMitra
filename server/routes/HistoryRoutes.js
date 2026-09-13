const express = require("express");
const router = express.Router();

const { getHistory, getUserHistory } = require("../controllers/HistoryController");
const { protect } = require("../middleware/authMiddleware");

// Authenticated — role-based own history
router.get("/", protect, getHistory);

// Admin or the user themself — history for a specific user
router.get("/:userId", protect, getUserHistory);

module.exports = router;