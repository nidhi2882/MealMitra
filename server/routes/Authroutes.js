const express = require("express");
const router = express.Router();

const { registerUser } = require("../controllers/authController");

//const { loginUser } = require("../controllers/authController");

//for registration
// Public route
router.post("/register", registerUser);

// for log-in
//router.post("/login",loginUser);

module.exports = router;