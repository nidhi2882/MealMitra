const express = require("express");
const router = express.Router();

const {
    createPickupRequest,
    getMyPickupRequests,
    getIncomingRequests,
    respondToPickupRequest,
} = require("../controllers/pickupController");
const { DONOR_ROLES } = require("../controllers/donationController");
const { protect } = require("../middleware/authMiddleware");
const { authorize } = require("../middleware/roleMiddleware");

// NGO-only routes
router.post("/", protect, authorize("NGO"), createPickupRequest);
router.get("/my-requests", protect, authorize("NGO"), getMyPickupRequests);

// Donor-only routes (Restaurant / EventOrganizer)
router.get("/incoming", protect, authorize(...DONOR_ROLES), getIncomingRequests);
router.put("/:id/respond", protect, authorize(...DONOR_ROLES), respondToPickupRequest);

module.exports = router;