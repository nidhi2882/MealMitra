const express = require("express");
const router = express.Router();

const { registerUser } = require("../controllers/authController");

const { loginUser } = require("../controllers/authController");

const { getMe } = require("../controllers/authController");
const { protect } = require("../middleware/authMiddleware");

//for registration
// Public route
router.post("/register", registerUser);

// for log-in
router.post("/login",loginUser);

//for get profile
router.get("/me", protect, getMe);

module.exports = router;