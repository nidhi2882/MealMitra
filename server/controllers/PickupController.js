const PickupRequest = require("../models/PickupRequest");
const Donation = require("../models/Donation");
const { DONOR_ROLES } = require("./donationController");

// @desc    NGO sends a pickup request for an available donation
// @route   POST /api/pickups
// @access  Private (NGO only)

const createPickupRequest = async (req,res) =>{
    try{
        const {donationId,note,pickupTime} = req.body;
        if(!donationId){
            return res.status(400).json({message:"donationId is required"});
        }
        const donation = await Donation.findById(donationId);
        if(!donation){
            return res.status(404).json({message:"Donation not found"});
        }
        if (donation.status !== "Available") {
            return res.status(400).json({
                message: `This donation is currently "${donation.status}" and cannot be requested.`,
            });
        }
        if (new Date(donation.expiryTime) <= new Date()) {
            return res.status(400).json({ message: "This donation has already expired." });
        }
        const pickupRequest = await PickupRequest.create({
            donationId,
            ngoId: req.user._id,
            note,
            pickupTime,
        });
        donation.status = "Requested";
        await donation.save();

        //add notification

        res.status(201).json({
            message: "Pickup request submitted successfully",
            requestId: pickupRequest._id,
            status: pickupRequest.status,
        });

    }catch(err){
        res.status(400).json({message:err.message});
    }
};

// @desc    Get all pickup requests the logged-in NGO has sent
// @route   GET /api/pickups/my-requests
// @access  Private (NGO only)
const getMyPickupRequests = async(req,res) =>{
    try{
        const requests = await PickupRequest.find({ ngoId: req.user._id })
            .populate("donationId")
            .sort({ createdAt: -1 });
        res.status(200).json(requests);
    }catch(err){
        res.status(400).json({message:err.message});
    }
};

// @desc    Get all pickup requests received for the logged-in donor's donations
// @route   GET /api/pickups/incoming
// @access  Private (Restaurant / EventOrganizer only)

const getIncomingRequests = async (req, res) => {
    try {
        const myDonations = await Donation.find({ donorId: req.user._id }).select("_id");
        const myDonationIds = myDonations.map((d) => d._id);

        const requests = await PickupRequest.find({ donationId: { $in: myDonationIds } })
            .populate("donationId")
            .populate("ngoId", "name email ngoName phone")
            .sort({ createdAt: -1 });

        res.status(200).json(requests);
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
};

// @desc    Donor accepts or rejects an incoming pickup request
// @route   PUT /api/pickups/:id/respond
// @access  Private (Restaurant / EventOrganizer — must own the underlying donation)
const respondToPickupRequest = async (req, res) => {
    try {
        const { decision } = req.body;
        if (!["Accepted", "Rejected"].includes(decision)) {
            return res.status(400).json({
                message: 'decision is required and must be exactly "Accepted" or "Rejected".',
            });
        }

        const pickupRequest = await PickupRequest.findById(req.params.id).populate("donationId");
        if (!pickupRequest) {
            return res.status(404).json({ message: "Pickup request not found." });
        }

        const donation = pickupRequest.donationId; // populated, so this is the full Donation doc
        if (!donation) {
            return res.status(404).json({ message: "The associated donation no longer exists." });
        }

        // Ownership check — only the donor who OWNS the donation can respond,
        // never just anyone with a Restaurant/EventOrganizer role.
        if (donation.donorId.toString() !== req.user._id.toString()) {
            return res.status(403).json({ message: "You can only respond to requests for your own donations." });
        }

        if (pickupRequest.status !== "Requested") {
            return res.status(400).json({
                message: `This request has already been "${pickupRequest.status}" and cannot be changed.`,
            });
        }

        pickupRequest.status = decision;
        await pickupRequest.save();

        // Keep the Donation's status in sync with the decision
        donation.status = decision === "Accepted" ? "Accepted" : "Available"; // rejected -> reopen for other NGOs
        await donation.save();

        // TODO (Notifications topic): notify the requesting NGO of the decision

        res.status(200).json({ message: `Pickup request ${decision}` });
    } catch (err) {
        res.status(400).json({ message: err.message });
    }
};

module.exports = {
    createPickupRequest,
    getMyPickupRequests,
    getIncomingRequests,
    respondToPickupRequest,
};

