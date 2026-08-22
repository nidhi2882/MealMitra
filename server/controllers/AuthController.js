const bcrypt = require("bcryptjs");
const User = require("../models/User");
const Restaurant = require("../models/Restaurant");
const EventOrganizer = require("../models/EventOrganizer");
const NGO = require("../models/NGO");
const generateToken = require("../utils/generateToken");

// Only these roles can self-register (R.1.1). Admin accounts are created
// separately/manually — never through the public register endpoint.
const roleModelMap = { Restaurant, EventOrganizer, NGO };

// @desc    Register a restaurant, event organizer, or NGO
// @route   POST /api/auth/register
// @access  Public
const registerUser = async (req, res) => {
    try {
        const { role, name, email, password, ...roleSpecificFields } = req.body;

        if (!name || !email || !password || !role) {
            return res.status(400).json({ message: "name, email, password, and role are required." });
        }

        const Model = roleModelMap[role];
        if (!Model) {
            return res.status(400).json({
                message: `Invalid role "${role}". Must be one of: ${Object.keys(roleModelMap).join(", ")}.`,
            });
        }

        const existingUser = await User.findOne({ email });
        if (existingUser) {
            return res.status(409).json({ message: "An account with this email already exists." });
        }

        const salt = await bcrypt.genSalt(10);
        const hashedPassword = await bcrypt.hash(password, salt);

        // e.g. Restaurant also needs organizationName, location, licenseNo —
        // these arrive in roleSpecificFields straight from the request body.
        const newUser = await Model.create({
            name,
            email,
            password: hashedPassword,
            ...roleSpecificFields,
        });

        res.status(201).json({
            message: "Registration successful. Your account is pending verification.",
            status: newUser.verificationStatus,
        });
    } catch (err) {
        // Mongoose validation errors (missing required field, etc.) land here
        res.status(400).json({ message: err.message });
    }
};


// @desc    Login and receive a JWT
// @route   POST /api/auth/login
// @access  Public
const loginUser = async (req, res) => {
    try {
        const { email, password } = req.body;

        if (!email || !password) {
            return res.status(400).json({ message: "email and password are required." });
        }

        // Query the base User model — matches regardless of role
        // (Restaurant, EventOrganizer, NGO, or Admin)
        const user = await User.findOne({ email });
        if (!user) {
            return res.status(401).json({ message: "Invalid email or password." });
        }

        const isMatch = await bcrypt.compare(password, user.password);
        if (!isMatch) {
            return res.status(401).json({ message: "Invalid email or password." });
        }

        // Only Admins can log in before verification — everyone else must
        // wait for admin approval first (R.1.2)
        if (user.role !== "Admin" && user.verificationStatus !== "Verified") {
            return res.status(403).json({
                message: `Your account is currently "${user.verificationStatus}". Please wait for admin approval before logging in.`,
            });
        }

        const token = generateToken(user._id, user.role);

        res.status(200).json({
            token,
            user: {
                id: user._id,
                name: user.name,
                email: user.email,
                role: user.role,
            },
        });
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
};

module.exports = {
    registerUser,
    loginUser,
};
