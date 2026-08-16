const mongoose = require("mongoose");

const pickupRequestSchema = new mongoose.Schema(
    {
        // NGO --requests--> PICKUP_REQUEST --(for)--> DONATION
        donationId: { type: mongoose.Schema.Types.ObjectId, ref: "Donation", required: true },
        ngoId: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
        requestDate: { type: Date, default: Date.now },
        pickupTime: { type: Date },
        status: {
            type: String,
            enum: ["Requested", "Accepted", "Rejected", "Picked Up", "Completed"],
            default: "Requested",
        },
    },
    { timestamps: true }
);

module.exports = mongoose.model("PickupRequest", pickupRequestSchema);