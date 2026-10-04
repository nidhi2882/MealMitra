const express = require("express");
const router = express.Router();

const {
    createPickupRequest,
    getMyPickupRequests,
    getIncomingRequests,
    respondToPickupRequest,
    updatePickupStatus,
    getPickupById,
} = require("../controllers/PickupController");
const { DONOR_ROLES } = require("../controllers/DonationController");
const { protect } = require("../middleware/Authmiddleware");
const { authorize } = require("../middleware/Rolemiddleware");

// NGO-only routes
router.post("/", protect, authorize("NGO"), createPickupRequest);
router.get("/my-requests", protect, authorize("NGO"), getMyPickupRequests);

// Donor-only routes (Restaurant / EventOrganizer)
router.get("/incoming", protect, authorize(...DONOR_ROLES), getIncomingRequests);
router.put("/:id/respond", protect, authorize(...DONOR_ROLES), respondToPickupRequest);

// Restaurant / NGO — update pickup status through its lifecycle
router.put("/:id/status", protect, authorize("Restaurant", "NGO"), updatePickupStatus);

// Authenticated — get a single pickup request by ID
router.get("/:id", protect, getPickupById);

module.exports = router;