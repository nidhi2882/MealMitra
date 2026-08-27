const User = require("../models/User");
// @desc    List all users, optionally filtered by role and/or status
// @route   GET /api/admin/users
// @route   GET /api/admin/users?role=Restaurant
// @route   GET /api/admin/users?verificationStatus=Pending
// @access  Private (Admin only)
const getAllUsers = async(req,res) =>{
    try {
        const filter = {};
        if (req.query.role) {
            filter.role = req.query.role;
        }
        if (req.query.verificationStatus) {
            filter.verificationStatus = req.query.verificationStatus;
        }
        const users = await User.find(filter).select("-password").sort({createdAt: -1});
        res.status(200).json(users);
    }catch (err){
        res.status(500).json({message: err.message});
    }
};

// @desc    List only users awaiting verification (dedicated endpoint per API doc)
// @route   GET /api/admin/users/pending
// @access  Private (Admin only)

const getPendingUsers = async (req, res) => {
    try {
        const pendingUsers = await User.find({ verificationStatus: "Pending" })
            .select("-password")
            .sort({ createdAt: 1 }); // oldest requests first — fairer review order

        res.status(200).json(pendingUsers);
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
};

const verifyUser = async (req,res) =>{
    try{
        const {decision,remarks} =req.body;
        if(!["Verified","Rejected"].includes(decision)){
            return res.status(400).json({
                message: 'decision is required and must be exactly "Verified" or "Rejected".',
            });
        }
        const user = await User.findById(req.params.id);
        if(!user){
            return res.status(404).json({message:"User Not Found"});
        }
        if(user.role === "Admin"){
            return res.status(400).json({message:"Admin accounts cannot be verified/rejected"});
        }
        user.verificationStatus = decision;
        if(remarks){
            user.verificationRemarks = remarks;
        }
        await user.save();
        //Add notification
        res.status(200).json({ message: `User status updated to ${decision}` });
    }catch (err) {
        res.status(400).json({ message: err.message });
    }
}

// @desc    Soft-delete a user account (does NOT physically remove the document)
// @route   DELETE /api/admin/users/:id
// @access  Private (Admin only)
const deleteUser = async (req,res) =>{
    try{
        const user = await User.findById(req.params.id);
        if(!user){
            return res.status(404).json({message: "User not found"});
        }
        if (user.role === "Admin") {
            return res.status(400).json({ message: "Admin accounts cannot be deleted through this endpoint." });
        }
        if (user.isDeleted) {
            return res.status(400).json({ message: "This user is already deleted." });
        }
        user.isDeleted = true;
        user.deletedAt = new Date();
        user.deletedBy = req.user_id;

        await user.save();
    }catch(err){
        res.status(400).json({ message: err.message });
    }
}

// @desc    Restore a soft-deleted user (undo)
// @route   PUT /api/admin/users/:id/restore
// @access  Private (Admin only)
const restoreUser = async (req, res) => {
    try {
        const user = await User.findOne({ _id: req.params.id }, null, { includeDeleted: true });
        if (!user) {
            return res.status(404).json({ message: "User not found." });
        }
        if (!user.isDeleted) {
            return res.status(400).json({ message: "This user is not deleted." });
        }
        user.isDeleted = false;
        user.deletedAt = null;
        user.deletedBy = null;
        await user.save();

        res.status(200).json({ message: "User restored successfully" });
    } catch (err) {
        res.status(400).json({ message: err.message });
    }
};
module.exports = {
    getAllUsers,
    getPendingUsers,
    verifyUser,
    deleteUser,
    restoreUser,
}