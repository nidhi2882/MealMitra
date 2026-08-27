const express = require("express");
const router = express.Router();

const {
    createDonation,
    updateDonation,
    deleteDonation,
    getMyDonations,
    getDonationById,
    DONOR_ROLES,
} = require("../controllers/DonationController");
const { protect } = require("../middleware/authMiddleware");
const { authorize } = require("../middleware/roleMiddleware");

// IMPORTANT: /my-donations must be defined BEFORE /:id.
// Express matches routes top-to-bottom — if /:id came first, a request to
// /api/donations/my-donations would incorrectly match /:id with
// id = "my-donations" instead of reaching this dedicated route.
router.get("/my-donations", protect, authorize(...DONOR_ROLES), getMyDonations);

router.post("/", protect, authorize(...DONOR_ROLES), createDonation);
router.put("/:id", protect, authorize(...DONOR_ROLES), updateDonation);
router.delete("/:id", protect, authorize(...DONOR_ROLES), deleteDonation);

// Any authenticated user (Restaurant, EventOrganizer, NGO, Admin) can view a single donation
router.get("/:id", protect, getDonationById);

module.exports = router;