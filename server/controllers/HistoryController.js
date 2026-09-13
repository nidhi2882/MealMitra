const Donation = require("../models/Donation");
const PickupRequest = require("../models/PickupRequest");
const { DONOR_ROLES } = require("./donationController");

// @desc    Get completed donation/pickup history for the logged-in user (role-based)
// @route   GET /api/history
// @access  Private (Authenticated)
const getHistory = async (req, res) => {
    try {
        const { role, _id } = req.user;

        if (DONOR_ROLES.includes(role)) {
            // Restaurant / EventOrganizer — their completed donations
            const donations = await Donation.find({ donorId: _id, status: "Completed" }).sort({
                updatedAt: -1,
            });
            return res.status(200).json(donations);
        }

        if (role === "NGO") {
            // NGO — their completed pickups
            const pickups = await PickupRequest.find({ ngoId: _id, status: "Completed" })
                .populate("donationId")
                .sort({ updatedAt: -1 });
            return res.status(200).json(pickups);
        }

        if (role === "Admin") {
            // Admin — platform-wide completed activity
            const donations = await Donation.find({ status: "Completed" }).sort({ updatedAt: -1 });
            return res.status(200).json(donations);
        }

        return res.status(403).json({ message: "Role not permitted to view history." });
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
};

// @desc    Get completed donation/pickup history for a specific user
// @route   GET /api/history/:userId
// @access  Private (Admin, or the user themself)
const getUserHistory = async (req, res) => {
    try {
        const { userId } = req.params;

        // Only Admin or the user themself can view this
        if (req.user.role !== "Admin" && req.user._id.toString() !== userId) {
            return res.status(403).json({ message: "You can only view your own history." });
        }

        const User = require("../models/User");
        const targetUser = await User.findById(userId);
        if (!targetUser) {
            return res.status(404).json({ message: "User not found." });
        }

        if (DONOR_ROLES.includes(targetUser.role)) {
            const donations = await Donation.find({ donorId: userId, status: "Completed" }).sort({
                updatedAt: -1,
            });
            return res.status(200).json(donations);
        }

        if (targetUser.role === "NGO") {
            const pickups = await PickupRequest.find({ ngoId: userId, status: "Completed" })
                .populate("donationId")
                .sort({ updatedAt: -1 });
            return res.status(200).json(pickups);
        }

        return res.status(200).json([]); // Admins have no donation/pickup history of their own
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
};

module.exports = {
    getHistory,
    getUserHistory,
};