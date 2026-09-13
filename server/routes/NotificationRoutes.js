const express = require("express");
const router = express.Router();

const {
    getNotifications,
    markNotificationRead,
    markAllRead,
    deleteNotification,
} = require("../controllers/NotificationController");
const { protect } = require("../middleware/authMiddleware");

// IMPORTANT: /read-all must come BEFORE /:id/read, otherwise Express would
// try to match "read-all" as an :id value on a route pattern like /:id/read
// (though here it wouldn't literally collide since paths differ in shape —
// but keeping specific string routes above param routes is good practice).
router.get("/", protect, getNotifications);
router.put("/read-all", protect, markAllRead);
router.put("/:id/read", protect, markNotificationRead);
router.delete("/:id", protect, deleteNotification);

module.exports = router;