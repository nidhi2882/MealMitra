const Notification = require("../models/Notification");
const asyncHandler = require("express-async-handler");

// @desc    Get all notifications for the logged-in user
// @route   GET /api/notifications
// @access  Private (Authenticated)
const getNotifications = asyncHandler(async (req, res) => {
    const notifications = await Notification.find({ userId: req.user._id }).sort({ createdAt: -1 });
    res.status(200).json(notifications);
});

// @desc    Mark a single notification as read
// @route   PUT /api/notifications/:id/read
// @access  Private (Authenticated — owner only)
const markNotificationRead = asyncHandler(async (req, res) => {
    const notification = await Notification.findById(req.params.id);
    if (!notification) {
        res.status(404);
        throw new Error("Notification not found.");
    }

    if (notification.userId.toString() !== req.user._id.toString()) {
        res.status(403);
        throw new Error("You can only update your own notifications.");
    }

    notification.isRead = true;
    await notification.save();

    res.status(200).json({ message: "Notification marked as read" });
});

// @desc    Mark all notifications for the logged-in user as read
// @route   PUT /api/notifications/read-all
// @access  Private (Authenticated)
const markAllRead = asyncHandler(async (req, res) => {
    await Notification.updateMany({ userId: req.user._id, isRead: false }, { isRead: true });
    res.status(200).json({ message: "All notifications marked as read" });
});

// @desc    Delete a specific notification
// @route   DELETE /api/notifications/:id
// @access  Private (Authenticated — owner only)
const deleteNotification = asyncHandler(async (req, res) => {
    const notification = await Notification.findById(req.params.id);
    if (!notification) {
        res.status(404);
        throw new Error("Notification not found.");
    }

    if (notification.userId.toString() !== req.user._id.toString()) {
        res.status(403);
        throw new Error("You can only delete your own notifications.");
    }

    await notification.deleteOne();

    res.status(200).json({ message: "Notification deleted successfully" });
});

module.exports = {
    getNotifications,
    markNotificationRead,
    markAllRead,
    deleteNotification,
};