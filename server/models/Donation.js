const mongoose = require("mongoose");

const donationSchema = new mongoose.Schema(
    {
        // "creates" relationship in your diagram: DONOR --creates--> DONATION
        donorId: {type: mongoose.Schema.Types.ObjectId, ref:"User",required:true},
        foodName: { type: String, required: true },
        foodType: { type: String, required: true },
        quantity: { type: Number, required: true, min: 1 },
        description: { type: String },
        expiryTime: { type: Date, required: true },
        pickupAddress: { type: String, required: true },
        status: {
            type: String,
            enum: ["Available", "Requested", "Accepted", "Picked Up", "Completed"],
            default: "Available",
        },
    },
    { timestamps: true }
);
module.exports = mongoose.model("Donation", donationSchema);