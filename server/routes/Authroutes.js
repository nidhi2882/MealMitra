const express = require("express");
const router = express.Router();

const { registerUser } = require("../controllers/AuthController");

const { loginUser } = require("../controllers/AuthController");

const { getMe } = require("../controllers/AuthController");
const { protect } = require("../middleware/Authmiddleware");
const {updateProfile}=require("../controllers/AuthController");
const {logoutUser} = require("../controllers/AuthController");


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