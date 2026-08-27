const express = require("express");
const router = express.Router();

const {
    getAllUsers,
    getPendingUsers,
    verifyUser,
    deleteUser,
    restoreUser,
} = require("../controllers/adminController");
const {protect} = require("../middleware/Authmiddleware");
const {authorize} = require("../middleware/Rolemiddleware");

router.get("/users",protect,authorize("Admin"),getAllUsers);
router.get("/users/pending",protect,authorize("Admin"),getPendingUsers);
router.put("/users/:id/verify", protect, authorize("Admin"), verifyUser);
router.delete("/users/:id", protect, authorize("Admin"), deleteUser);
router.put("/users/:id/restore", protect, authorize("Admin"), restoreUser);
module.exports = router;