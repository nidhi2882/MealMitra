const mongoose = require("mongoose");

const options = { discriminatorKey: "role", timestamps: true };

const userSchema = new mongoose.Schema(
    {
        name: { type: String, required: true },
        email: { type: String, required: true, unique: true, lowercase: true, trim: true },
        password: { type: String, required: true },
        phone: { type: String },
        address: { type: String },
        verificationStatus: {
            type: String,
            enum: ["Pending", "Verified", "Rejected"],
            default: "Pending",
        },
        verificationRemarks: { type: String },

        isDeleted: { type: Boolean, default: false },
        deletedAt: { type: Date, default: null },
        deletedBy: { type: mongoose.Schema.Types.ObjectId, ref: "User", default: null },
    },
    options
);

// IMPORTANT: this hook MUST be registered before mongoose.model() is called
// below. Mongoose compiles schema middleware at model-creation time — adding
// pre/post hooks to the schema AFTER calling mongoose.model() will silently
// not apply to queries run through that model. This bit us once already:
// deleted users kept appearing in results until this was reordered correctly.
function excludeDeleted() {
    if (!this.getOptions().includeDeleted) {
        this.where({ isDeleted: { $ne: true } });
    }
}
userSchema.pre(["find", "findOne", "findOneAndUpdate", "countDocuments"], excludeDeleted);

// Model compilation happens AFTER the hook is registered above
const User = mongoose.model("User", userSchema);

module.exports = User;