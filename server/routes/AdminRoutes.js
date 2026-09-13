const express = require("express");
const router = express.Router();

const {
    getAllUsers,
    getPendingUsers,
    verifyUser,
    deleteUser,
    restoreUser,
    getAllDonations,
    removeDonation,
    getSummaryReport,
    getDonationReport,
    getUserReport,
} = require("../controllers/adminController");
const { protect } = require("../middleware/Authmiddleware");
const { authorize } = require("../middleware/Rolemiddleware");

router.get("/users", protect, authorize("Admin"), getAllUsers);
router.get("/users/pending", protect, authorize("Admin"), getPendingUsers);
router.put("/users/:id/verify", protect, authorize("Admin"), verifyUser);
router.delete("/users/:id", protect, authorize("Admin"), deleteUser);
router.put("/users/:id/restore", protect, authorize("Admin"), restoreUser);

// Donation moderation
router.get("/donations", protect, authorize("Admin"), getAllDonations);
router.delete("/donations/:id", protect, authorize("Admin"), removeDonation);

// Reports
router.get("/reports/summary", protect, authorize("Admin"), getSummaryReport);
router.get("/reports/donations", protect, authorize("Admin"), getDonationReport);
router.get("/reports/users", protect, authorize("Admin"), getUserReport);

module.exports = router;