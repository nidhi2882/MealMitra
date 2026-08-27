const Donation = require("../models/Donation");

//Only restaurants and donors can create/manage donations

const DONOR_ROLES = ["Restaurant","EventOrganizer"];


// @desc    Create a new food donation listing
// @route   POST /api/donations
// @access  Private (Restaurant / EventOrganizer only)
const createDonation = async(req,res) =>{
    try{
        const {foodName,foodType,quantity,description,expiryTime,pickupAddress} = req.body;
        if(!foodName || !foodType || !quantity || !expiryTime || !pickupAddress){
            return res.status(400).json({
                message: "foodName, foodType, quantity, expiryTime, and pickupAddress are required.",
            });
        }
        if (new Date(expiryTime) <= new Date()) {
            return res.status(400).json({ message: "expiryTime must be in the future." });
        }
        const donation = await Donation.create({
            donorId: req.user._id, // whoever is logged in — from `protect` middleware
            foodName,
            foodType,
            quantity,
            description,
            expiryTime,
            pickupAddress,
            // status defaults to "Available" per the schema
        });
        res.status(201).json({
            message: "Donation listed successfully",
            donationId: donation._id,
            status: donation.status,
        });
    }catch (err){
        res.status(400).json({message:err.message});
    }
};
// @desc    Update a donation — only the owner, and only before it's accepted
// @route   PUT /api/donations/:id
// @access  Private (Restaurant / EventOrganizer — owner only)
const updateDonation = async (req, res) => {
    try {
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
        const allowedFields = ["foodName", "foodType", "quantity", "description", "expiryTime", "pickupAddress"];
        allowedFields.forEach((field) => {
            if (req.body[field] !== undefined) {
                donation[field] = req.body[field];
            }
        });

        await donation.save();

        res.status(200).json({ message: "Donation updated successfully" });
    } catch (err) {
        res.status(400).json({ message: err.message });
    }
};

// @desc    Delete a donation — only the owner, and only before it's accepted
// @route   DELETE /api/donations/:id
// @access  Private (Restaurant / EventOrganizer — owner only)
const deleteDonation = async (req, res) => {
    try {
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

        res.status(200).json({ message: "Donation removed successfully" });
    } catch (err) {
        res.status(400).json({ message: err.message });
    }
};

// @desc    Get all donations created by the logged-in donor
// @route   GET /api/donations/my-donations
// @access  Private (Restaurant / EventOrganizer)
const getMyDonations = async (req, res) => {
    try {
        const donations = await Donation.find({ donorId: req.user._id }).sort({ createdAt: -1 });
        res.status(200).json(donations);
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
};

// @desc    Get full details of a single donation
// @route   GET /api/donations/:id
// @access  Private (any authenticated, logged-in user)
const getDonationById = async (req, res) => {
    try {
        const donation = await Donation.findById(req.params.id).populate("donorId", "name email role");
        if (!donation) {
            return res.status(404).json({ message: "Donation not found." });
        }
        res.status(200).json(donation);
    } catch (err) {
        res.status(400).json({ message: err.message });
    }
};

module.exports = {
    createDonation,
    updateDonation,
    deleteDonation,
    getMyDonations,
    getDonationById,
    DONOR_ROLES,
};
