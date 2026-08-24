const express = require("express");
const router = express.Router();

const { registerUser } = require("../controllers/authController");

const { loginUser } = require("../controllers/authController");
const {protect} = require("../middleware/Authmiddleware");
const {updateProfile} = require("../controllers/authController");
const {logoutUser} = require("../controllers/AuthController");
//for registration
// Public route
router.post("/register", registerUser);

// for log-in
router.post("/login",loginUser)

// //updateProfile;
// router.put("/profile", protect, updateProfile);
// //logoutUser
// router.post("/logout",protect,logoutUser);

module.exports = router;