const asyncHandler = require("express-async-handler");
const { generateAdminReportPDF } = require("../utils/pdfGenerator");
const User = require("../models/User");
const Donation = require("../models/Donation");
const PickupRequest = require("../models/PickupRequest");
const Notification = require("../models/Notification");
const { emitToAll, emitToUser } = require("../config/socket");
// @desc    List all users, optionally filtered by role and/or status
// @route   GET /api/admin/users
// @route   GET /api/admin/users?role=Restaurant
// @route   GET /api/admin/users?verificationStatus=Pending
// @access  Private (Admin only)
const getAllUsers = asyncHandler(async (req, res) => {
        const filter = {};
        if (req.query.role) {
            filter.role = req.query.role;
        }
        if (req.query.verificationStatus) {
            filter.verificationStatus = req.query.verificationStatus;
        }
        const page = parseInt(req.query.page, 10) || 1;
        const limit = parseInt(req.query.limit, 10) || 10;
        const skip = (page - 1) * limit;

        const users = await User.find(filter).select("-password").sort({ createdAt: -1 }).skip(skip).limit(limit);
        const total = await User.countDocuments(filter);
        res.status(200).json({ users, page, totalPages: Math.ceil(total / limit), total });
    });

// @desc    List only users awaiting verification (dedicated endpoint per API doc)
// @route   GET /api/admin/users/pending
// @access  Private (Admin only)

const getPendingUsers = asyncHandler(async (req, res) => {
        const pendingUsers = await User.find({ verificationStatus: "Pending" })
            .select("-password")
            .sort({ createdAt: 1 }); // oldest requests first — fairer review order

        res.status(200).json(pendingUsers);
    });

const verifyUser = asyncHandler(async (req, res) => {
        const { decision, remarks } = req.body;
        if (!["Verified", "Rejected"].includes(decision)) {
            return res.status(400).json({
                message: 'decision is required and must be exactly "Verified" or "Rejected".',
            });
        }
        const user = await User.findById(req.params.id);
        if (!user) {
            return res.status(404).json({ message: "User Not Found" });
        }
        if (user.role === "Admin") {
            return res.status(400).json({ message: "Admin accounts cannot be verified/rejected" });
        }
        user.verificationStatus = decision;
        if (remarks) {
            user.verificationRemarks = remarks;
        }
        await user.save();
        
        // Add notification for the user
        await Notification.create({
            userId: user._id,
            message: `Your account verification status has been updated to: ${decision}.`
        });

        res.status(200).json({ message: `User status updated to ${decision}` });
    });

// @desc    Soft-delete a user account (does NOT physically remove the document)
// @route   DELETE /api/admin/users/:id
// @access  Private (Admin only)
const deleteUser = asyncHandler(async (req, res) => {
        const user = await User.findById(req.params.id);
        if (!user) {
            return res.status(404).json({ message: "User not found" });
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
    });

// @desc    Restore a soft-deleted user (undo)
// @route   PUT /api/admin/users/:id/restore
// @access  Private (Admin only)
const restoreUser = asyncHandler(async (req, res) => {
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
    });

// @desc    Get all donation listings on the platform for moderation
// @route   GET /api/admin/donations
// @route   GET /api/admin/donations?status=Available
// @access  Private (Admin only)
const getAllDonations = asyncHandler(async (req, res) => {
        const filter = {};
        if (req.query.status) {
            filter.status = req.query.status;
        }
        const page = parseInt(req.query.page, 10) || 1;
        const limit = parseInt(req.query.limit, 10) || 10;
        const skip = (page - 1) * limit;

        const donations = await Donation.find(filter)
            .populate("donorId", "name role email")
            .sort({ createdAt: -1 }).skip(skip).limit(limit);
        const total = await Donation.countDocuments(filter);
        res.status(200).json({ donations, page, totalPages: Math.ceil(total / limit), total });
    });

// @desc    Remove an invalid, expired, or inappropriate donation listing
// @route   DELETE /api/admin/donations/:id
// @access  Private (Admin only)
const removeDonation = asyncHandler(async (req, res) => {
        const donation = await Donation.findById(req.params.id);
        if (!donation) {
            return res.status(404).json({ message: "Donation not found." });
        }

        // Admin override — no ownership/status restriction, unlike the
        // owner-only deleteDonation in donationController
        await donation.deleteOne();

        // Broadcast real-time deletion
        emitToAll("donation:deleted", { id: req.params.id });

        res.status(200).json({ message: "Donation removed by admin" });
    });

// @desc    Overall platform statistics
// @route   GET /api/admin/reports/summary
// @access  Private (Admin only)
const getSummaryReport = asyncHandler(async (req, res) => {
        const totalUsers = await User.countDocuments({ isDeleted: { $ne: true } });
        const totalDonations = await Donation.countDocuments();
        const completedPickups = await PickupRequest.countDocuments({ status: "Completed" });

        res.status(200).json({
            totalUsers,
            totalDonations,
            completedPickups,
        });
    });

// @desc    Donation trend data for graphical/statistical summaries (monthly counts & completions)
// @route   GET /api/admin/reports/donations
// @access  Private (Admin only)
const getDonationReport = asyncHandler(async (req, res) => {
    const monthlyDonations = await Donation.aggregate([
        {
            $group: {
                _id: { year: { $year: "$createdAt" }, month: { $month: "$createdAt" } },
                count: { $sum: 1 },
                servings: { $sum: "$quantity" },
            },
        },
        { $sort: { "_id.year": 1, "_id.month": 1 } },
    ]);

    const monthNames = [
        "Jan", "Feb", "Mar", "Apr", "May", "Jun",
        "Jul", "Aug", "Sep", "Oct", "Nov", "Dec",
    ];

    const formatted = await Promise.all(
        monthlyDonations.map(async (m) => {
            const completedCount = await PickupRequest.countDocuments({
                status: "Completed",
                $expr: {
                    $and: [
                        { $eq: [{ $year: "$updatedAt" }, m._id.year] },
                        { $eq: [{ $month: "$updatedAt" }, m._id.month] },
                    ],
                },
            });

            const mName = monthNames[m._id.month - 1];
            return {
                month: mName,
                year: m._id.year,
                label: `${mName} ${m._id.year}`,
                count: m.count,
                donations: m.count,
                pickups: completedCount,
                servings: m.servings || 0,
                fulfillmentRate: m.count > 0 ? Math.round((completedCount / m.count) * 100) : 0,
            };
        })
    );

    res.status(200).json({ monthly: formatted });
});

// @desc    User growth & verification statistics
// @route   GET /api/admin/reports/users
// @access  Private (Admin only)
const getUserReport = asyncHandler(async (req, res) => {
    const totalRestaurants = await User.countDocuments({ role: "Restaurant", isDeleted: { $ne: true } });
    const totalNGOs = await User.countDocuments({ role: "NGO", isDeleted: { $ne: true } });
    const pendingVerification = await User.countDocuments({ verificationStatus: "Pending", isDeleted: { $ne: true } });
    const verifiedUsers = await User.countDocuments({ verificationStatus: "Verified", isDeleted: { $ne: true } });

    res.status(200).json({
        totalRestaurants,
        totalNGOs,
        pendingVerification,
        verifiedUsers,
        totalUsers: totalRestaurants + totalNGOs,
    });
});

// @desc    Generate PDF Report
// @route   GET /api/admin/reports/pdf
// @access  Private (Admin only)
const generatePDFReport = asyncHandler(async (req, res) => {
    // 1. Core platform metrics
    const [
        totalUsers,
        totalRestaurants,
        totalNGOs,
        pendingVerification,
        verifiedUsers,
        totalDonations,
        completedPickups,
    ] = await Promise.all([
        User.countDocuments({ isDeleted: { $ne: true } }),
        User.countDocuments({ role: "Restaurant", isDeleted: { $ne: true } }),
        User.countDocuments({ role: "NGO", isDeleted: { $ne: true } }),
        User.countDocuments({ verificationStatus: "Pending", isDeleted: { $ne: true } }),
        User.countDocuments({ verificationStatus: "Verified", isDeleted: { $ne: true } }),
        Donation.countDocuments(),
        PickupRequest.countDocuments({ status: "Completed" }),
    ]);

    // 2. Rescued servings aggregation
    const rescuedResult = await Donation.aggregate([
        { $match: { status: "Completed" } },
        { $group: { _id: null, total: { $sum: "$quantity" } } },
    ]);
    const rescuedServings = rescuedResult[0]?.total || (completedPickups > 0 ? completedPickups * 45 : 0);

    // 3. Monthly trends aggregation
    const monthlyDonations = await Donation.aggregate([
        {
            $group: {
                _id: { year: { $year: "$createdAt" }, month: { $month: "$createdAt" } },
                count: { $sum: 1 },
                servings: { $sum: "$quantity" },
            },
        },
        { $sort: { "_id.year": -1, "_id.month": -1 } },
        { $limit: 6 },
    ]);

    const monthNames = [
        "Jan", "Feb", "Mar", "Apr", "May", "Jun",
        "Jul", "Aug", "Sep", "Oct", "Nov", "Dec",
    ];

    const monthlyTrends = await Promise.all(
        monthlyDonations.map(async (m) => {
            const completedCount = await PickupRequest.countDocuments({
                status: "Completed",
                $expr: {
                    $and: [
                        { $eq: [{ $year: "$updatedAt" }, m._id.year] },
                        { $eq: [{ $month: "$updatedAt" }, m._id.month] },
                    ],
                },
            });

            return {
                month: `${monthNames[m._id.month - 1]} ${m._id.year}`,
                count: m.count,
                completed: completedCount,
                servings: m.servings,
                rate: m.count > 0 ? `${Math.round((completedCount / m.count) * 100)}%` : "0%",
            };
        })
    );

    // 4. Recent completed activity
    const recentCompletedPickups = await PickupRequest.find({ status: "Completed" })
        .populate({
            path: "donationId",
            populate: { path: "donorId", select: "name organizationName" },
        })
        .populate("ngoId", "name ngoName")
        .sort({ updatedAt: -1 })
        .limit(5);

    const recentActivity = recentCompletedPickups.map((p) => ({
        date: new Date(p.updatedAt || p.createdAt).toLocaleDateString("en-IN", {
            day: "2-digit",
            month: "short",
        }),
        foodName: p.donationId?.foodName || "Surplus Food",
        donorName: p.donationId?.donorId?.organizationName || p.donationId?.donorId?.name || "Restaurant Partner",
        ngoName: p.ngoId?.ngoName || p.ngoId?.name || "NGO Partner",
        quantity: p.donationId?.quantity || 1,
    }));

    const fulfillmentRate = totalDonations > 0 ? `${Math.round((completedPickups / totalDonations) * 100)}%` : "0%";
    const verificationRate = totalUsers > 0 ? `${Math.round((verifiedUsers / totalUsers) * 100)}%` : "100%";

    // Set headers for PDF download
    res.setHeader("Content-Disposition", 'attachment; filename="MealMitra_Summary_Report.pdf"');
    res.setHeader("Content-Type", "application/pdf");

    // Generate executive-formatted PDF
    generateAdminReportPDF(res, {
        reportRef: `MM-REP-${Date.now().toString().slice(-6)}`,
        generatedDate: new Date().toLocaleDateString("en-IN", {
            day: "2-digit",
            month: "short",
            year: "numeric",
            hour: "2-digit",
            minute: "2-digit",
        }),
        generatedBy: req.user?.email || "Platform Administrator",
        totalUsers,
        totalRestaurants,
        totalNGOs,
        pendingVerification,
        verifiedUsers,
        totalDonations,
        completedPickups,
        rescuedServings,
        fulfillmentRate,
        verificationRate,
        monthlyTrends,
        recentActivity,
    });
});

module.exports = {
    getAllUsers,
    getPendingUsers,
    verifyUser,
    deleteUser,
    restoreUser,
    getAllDonations,
    removeDonation,
    getSummaryReport,
    getDonationReport,
    getUserReport,
    generatePDFReport,
};