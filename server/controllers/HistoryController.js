const Donation = require("../models/Donation");
const PickupRequest = require("../models/PickupRequest");
const User = require("../models/User");
const { DONOR_ROLES } = require("./DonationController");
const asyncHandler = require("express-async-handler");
const { generateDonationReceiptPDF } = require("../utils/pdfGenerator");
const mongoose = require("mongoose");

// @desc    Get completed donation/pickup history for the logged-in user (role-based)
// @route   GET /api/history
// @access  Private (Authenticated)
const getHistory = asyncHandler(async (req, res) => {
    const { role, _id } = req.user;

    if (DONOR_ROLES.includes(role)) {
        // Restaurant / EventOrganizer — their completed donations
        const donations = await Donation.find({ donorId: _id, status: "Completed" })
            .sort({ updatedAt: -1 })
            .lean();

        // Attach completed pickup & NGO info if exists
        const donationIds = donations.map((d) => d._id);
        const pickups = await PickupRequest.find({
            donationId: { $in: donationIds },
            status: "Completed",
        }).populate("ngoId", "name ngoName email phone").lean();

        const pickupMap = {};
        pickups.forEach((p) => {
            pickupMap[p.donationId.toString()] = p;
        });

        const enriched = donations.map((d) => {
            const match = pickupMap[d._id.toString()];
            return {
                ...d,
                pickupId: match?._id || null,
                ngoId: match?.ngoId || null,
                completedAt: match?.updatedAt || d.updatedAt,
            };
        });

        return res.status(200).json(enriched);
    }

    if (role === "NGO") {
        // NGO — their completed pickups with donor details populated
        const pickups = await PickupRequest.find({ ngoId: _id, status: "Completed" })
            .populate({
                path: "donationId",
                populate: { path: "donorId", select: "name organizationName email phone address" },
            })
            .sort({ updatedAt: -1 });
        return res.status(200).json(pickups);
    }

    if (role === "Admin") {
        // Admin — platform-wide completed activity
        const donations = await Donation.find({ status: "Completed" })
            .populate("donorId", "name organizationName email phone address")
            .sort({ updatedAt: -1 })
            .lean();

        const donationIds = donations.map((d) => d._id);
        const pickups = await PickupRequest.find({
            donationId: { $in: donationIds },
            status: "Completed",
        }).populate("ngoId", "name ngoName email phone").lean();

        const pickupMap = {};
        pickups.forEach((p) => {
            pickupMap[p.donationId.toString()] = p;
        });

        const enriched = donations.map((d) => {
            const match = pickupMap[d._id.toString()];
            return {
                ...d,
                pickupId: match?._id || null,
                ngoId: match?.ngoId || null,
                completedAt: match?.updatedAt || d.updatedAt,
            };
        });

        return res.status(200).json(enriched);
    }

    res.status(403);
    throw new Error("Role not permitted to view history.");
});

// @desc    Get completed donation/pickup history for a specific user
// @route   GET /api/history/:userId
// @access  Private (Admin, or the user themself)
const getUserHistory = asyncHandler(async (req, res) => {
    const { userId } = req.params;

    // Only Admin or the user themself can view this
    if (req.user.role !== "Admin" && req.user._id.toString() !== userId) {
        res.status(403);
        throw new Error("You can only view your own history.");
    }

    const targetUser = await User.findById(userId);
    if (!targetUser) {
        res.status(404);
        throw new Error("User not found.");
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
});

// @desc    Generate Official Certificate of Food Donation & Handover PDF
// @route   GET /api/history/:id/certificate
// @access  Private (Donor, Recipient NGO, or Admin)
const generateCertificatePDF = asyncHandler(async (req, res) => {
    const { id } = req.params;

    if (!mongoose.Types.ObjectId.isValid(id)) {
        res.status(400);
        throw new Error("Invalid donation or handover record ID.");
    }

    let donation = null;
    let pickup = null;

    // Try finding PickupRequest first
    pickup = await PickupRequest.findById(id)
        .populate({
            path: "donationId",
            populate: { path: "donorId" },
        })
        .populate("ngoId");

    if (pickup) {
        donation = pickup.donationId;
    } else {
        // If not a PickupRequest ID, try finding as Donation ID
        donation = await Donation.findById(id).populate("donorId");
        if (donation) {
            pickup = await PickupRequest.findOne({ donationId: donation._id, status: "Completed" })
                .populate("ngoId");
        }
    }

    if (!donation) {
        res.status(404);
        throw new Error("Donation record not found.");
    }

    if (donation.status !== "Completed" && pickup?.status !== "Completed") {
        res.status(400);
        throw new Error("A certificate can only be issued for completed donations.");
    }

    // Access control: Only Donor, Recipient NGO, or Admin can download
    const currentUserId = req.user._id.toString();
    const donorUserId = donation.donorId?._id?.toString() || donation.donorId?.toString();
    const ngoUserId = pickup?.ngoId?._id?.toString() || pickup?.ngoId?.toString();
    const isAdmin = req.user.role === "Admin";

    if (!isAdmin && currentUserId !== donorUserId && currentUserId !== ngoUserId) {
        res.status(403);
        throw new Error("You are not authorized to download this certificate.");
    }

    const donorUser = donation.donorId || {};
    const ngoUser = pickup?.ngoId || {};

    const completionDate = new Date(pickup?.updatedAt || donation.updatedAt || Date.now());
    const receiptYear = completionDate.getFullYear();
    const shortCode = (donation._id.toString()).slice(-6).toUpperCase();
    const receiptId = `MM-RCPT-${receiptYear}-${shortCode}`;

    const receiptData = {
        receiptId,
        securityHash: `SEC-MM-${(donation._id.toString() + (pickup?._id?.toString() || "")).slice(-12).toUpperCase()}-VERIFIED`,
        completedAt: completionDate.toLocaleDateString("en-IN", {
            day: "2-digit",
            month: "short",
            year: "numeric",
            hour: "2-digit",
            minute: "2-digit",
        }),
        pickupAddress: donation.pickupAddress || donorUser.address || "Designated Pickup Point",
        donation: {
            foodName: donation.foodName,
            foodType: donation.foodType,
            quantity: donation.quantity,
            description: donation.description,
        },
        donor: {
            name: donorUser.name,
            organizationName: donorUser.organizationName || donorUser.name,
            email: donorUser.email,
            phone: donorUser.phone,
            address: donorUser.address,
        },
        ngo: {
            name: ngoUser.name,
            ngoName: ngoUser.ngoName || ngoUser.name || "MealMitra Partner NGO",
            registrationNo: ngoUser.registrationNo || "Verified Community Partner",
            email: ngoUser.email,
            phone: ngoUser.phone,
        },
    };

    res.setHeader("Content-Disposition", `attachment; filename="MealMitra_Donation_Receipt_${shortCode}.pdf"`);
    res.setHeader("Content-Type", "application/pdf");

    generateDonationReceiptPDF(res, receiptData);
});

module.exports = {
    getHistory,
    getUserHistory,
    generateCertificatePDF,
};