const asyncHandler = require("express-async-handler");
const Donation = require("../models/Donation");
const { emitToAll } = require("../config/socket");

//Only restaurants and donors can create/manage donations

const DONOR_ROLES = ["Restaurant","EventOrganizer"];

// @desc    Browse/filter all AVAILABLE donations
// @route   GET /api/donations
// @route   GET /api/donations?foodType=Cooked Meal
// @route   GET /api/donations?location=Ahmedabad
// @route   GET /api/donations?minQuantity=5
// @route   GET /api/donations?expiryBefore=2026-09-01T00:00:00Z
// @access  Private (NGO only)
const browseDonations = asyncHandler(async (req,res) => {
        const filter = {
            status: "Available",
            expiryTime: { $gt: new Date() } // Only show donations that haven't expired yet
        };
        if (req.query.foodType) {
            // "cooked" matches "Cooked Meal"
            filter.foodType = new RegExp(req.query.foodType, "i");
        }
        if (req.query.location) {
            filter.pickupAddress = new RegExp(req.query.location, "i");
        }
        if (req.query.minQuantity) {
            filter.quantity = {$gte: Number(req.query.minQuantity)};
        }
        if (req.query.expiryBefore) {
            filter.expiryTime.$lte = new Date(req.query.expiryBefore);
        }
        const page = parseInt(req.query.page, 10) || 1;
        const limit = parseInt(req.query.limit, 10) || 10;
        const skip = (page - 1) * limit;

        const donations = await Donation.find(filter)
            .populate("donorId", "name role organizationName location") // show who's donating, without exposing password etc.
            .sort({expiryTime: 1}) // soonest-expiring first — most urgent to pick up
            .skip(skip)
            .limit(limit);

        const total = await Donation.countDocuments(filter);

        res.status(200).json({
            donations,
            page,
            totalPages: Math.ceil(total / limit),
            total
        });
    });
// @desc    Create a new food donation listing
// @route   POST /api/donations
// @access  Private (Restaurant / EventOrganizer only)
const createDonation = asyncHandler(async (req,res) => {
        const {foodName,foodType,quantity,description,expiryTime,pickupAddress,location} = req.body;
        if(!foodName || !foodType || !quantity || !expiryTime || !pickupAddress){
            return res.status(400).json({
                message: "foodName, foodType, quantity, expiryTime, and pickupAddress are required.",
            });
        }
        if (new Date(expiryTime) <= new Date()) {
            return res.status(400).json({ message: "expiryTime must be in the future." });
        }
        const donationData = {
            donorId: req.user._id, // whoever is logged in — from `protect` middleware
            foodName,
            foodType,
            quantity,
            description,
            expiryTime,
            pickupAddress,
        };
        if (location && typeof location.lat === "number" && typeof location.lng === "number") {
            donationData.location = location;
        }

        const donation = await Donation.create(donationData);

        // Broadcast real-time event to all connected users
        emitToAll("donation:created", donation);

        res.status(201).json({
            message: "Donation listed successfully",
            donationId: donation._id,
            status: donation.status,
        });
    });
// @desc    Update a donation — only the owner, and only before it's accepted
// @route   PUT /api/donations/:id
// @access  Private (Restaurant / EventOrganizer — owner only)
const updateDonation = asyncHandler(async (req, res) => {
        const donation = await Donation.findById(req.params.id);
        if (!donation) {
            return res.status(404).json({ message: "Donation not found." });
        }

        // Ownership check — compare the donation's donorId to the logged-in user's id.
        // Both are ObjectIds, so .toString() before comparing with !==.
        if (donation.donorId.toString() !== req.user._id.toString()) {
            return res.status(403).json({ message: "You can only edit your own donations." });
        }

        if (donation.status !== "Available") {
            return res.status(400).json({
                message: `Cannot edit a donation once it is "${donation.status}". Only "Available" donations can be edited.`,
            });
        }

        // Only allow these specific fields to be changed — never let the request
        // body overwrite donorId or status directly through this route.
        const allowedFields = ["foodName", "foodType", "quantity", "description", "expiryTime", "pickupAddress", "location"];
        allowedFields.forEach((field) => {
            if (req.body[field] !== undefined) {
                donation[field] = req.body[field];
            }
        });

        await donation.save();

        // Broadcast real-time update event
        emitToAll("donation:updated", donation);

        res.status(200).json({ message: "Donation updated successfully" });
    });

// @desc    Delete a donation — only the owner, and only before it's accepted
// @route   DELETE /api/donations/:id
// @access  Private (Restaurant / EventOrganizer — owner only)
const deleteDonation = asyncHandler(async (req, res) => {
        const donation = await Donation.findById(req.params.id);
        if (!donation) {
            return res.status(404).json({ message: "Donation not found." });
        }

        if (donation.donorId.toString() !== req.user._id.toString()) {
            return res.status(403).json({ message: "You can only delete your own donations." });
        }

        if (donation.status !== "Available") {
            return res.status(400).json({
                message: `Cannot delete a donation once it is "${donation.status}". Only "Available" donations can be deleted.`,
            });
        }

        await donation.deleteOne();

        // Broadcast real-time deletion event
        emitToAll("donation:deleted", { id: req.params.id });

        res.status(200).json({ message: "Donation removed successfully" });
    });

// @desc    Get all donations created by the logged-in donor
// @route   GET /api/donations/my-donations
// @access  Private (Restaurant / EventOrganizer)
const getMyDonations = asyncHandler(async (req, res) => {
        const donations = await Donation.find({ donorId: req.user._id }).sort({ createdAt: -1 });
        res.status(200).json(donations);
    });

// @desc    Get full details of a single donation
// @route   GET /api/donations/:id
// @access  Private (any authenticated, logged-in user)
const getDonationById = asyncHandler(async (req, res) => {
        const donation = await Donation.findById(req.params.id).populate("donorId", "name email role");
        if (!donation) {
            return res.status(404).json({ message: "Donation not found." });
        }
        res.status(200).json(donation);
    });

module.exports = {
    browseDonations,
    createDonation,
    updateDonation,
    deleteDonation,
    getMyDonations,
    getDonationById,
    DONOR_ROLES,
};
