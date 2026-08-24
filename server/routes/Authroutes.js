const express = require("express");
const router = express.Router();

const { registerUser } = require("../controllers/authController");

const { loginUser } = require("../controllers/authController");

const { getMe } = require("../controllers/authController");
const { protect } = require("../middleware/authMiddleware");
const {updateProfile}=require("../controllers/authController");
const {logoutUser} = require("../controllers/authController");


//for registration
// Public route
router.post("/register", registerUser);

// for log-in
router.post("/login",loginUser);

//for get profile
router.get("/me", protect, getMe);

//for update profile
router.put("/profile", protect, updateProfile);

//for logout user
router.post("/logout", protect, logoutUser);
module.exports = router;