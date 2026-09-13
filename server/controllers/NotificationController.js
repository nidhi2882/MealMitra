const Notification = require("../models/Notification");

// @desc    Get all notifications for the logged-in user
// @route   GET /api/notifications
// @access  Private (Authenticated)
const getNotifications = async (req, res) => {
    try {
        const notifications = await Notification.find({ userId: req.user._id }).sort({ createdAt: -1 });
        res.status(200).json(notifications);
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
};

// @desc    Mark a single notification as read
// @route   PUT /api/notifications/:id/read
// @access  Private (Authenticated — owner only)
const markNotificationRead = async (req, res) => {
    try {
        const notification = await Notification.findById(req.params.id);
        if (!notification) {
            return res.status(404).json({ message: "Notification not found." });
        }

        if (notification.userId.toString() !== req.user._id.toString()) {
            return res.status(403).json({ message: "You can only update your own notifications." });
        }

        notification.isRead = true;
        await notification.save();

        res.status(200).json({ message: "Notification marked as read" });
    } catch (err) {
        res.status(400).json({ message: err.message });
    }
};

// @desc    Mark all notifications for the logged-in user as read
// @route   PUT /api/notifications/read-all
// @access  Private (Authenticated)
const markAllRead = async (req, res) => {
    try {
        await Notification.updateMany({ userId: req.user._id, isRead: false }, { isRead: true });
        res.status(200).json({ message: "All notifications marked as read" });
    } catch (err) {
        res.status(400).json({ message: err.message });
    }
};

// @desc    Delete a specific notification
// @route   DELETE /api/notifications/:id
// @access  Private (Authenticated — owner only)
const deleteNotification = async (req, res) => {
    try {
        const notification = await Notification.findById(req.params.id);
        if (!notification) {
            return res.status(404).json({ message: "Notification not found." });
        }

        if (notification.userId.toString() !== req.user._id.toString()) {
            return res.status(403).json({ message: "You can only delete your own notifications." });
        }

        await notification.deleteOne();

        res.status(200).json({ message: "Notification deleted successfully" });
    } catch (err) {
        res.status(400).json({ message: err.message });
    }
};

module.exports = {
    getNotifications,
    markNotificationRead,
    markAllRead,
    deleteNotification,
};