const bcrypt = require("bcryptjs");
const User = require("../models/User");
const Restaurant = require("../models/Restaurant");
const EventOrganizer = require("../models/EventOrganizer");
const NGO = require("../models/NGO");
const generateToken = require("../utils/generateToken");
const asyncHandler = require("express-async-handler");

// Only these roles can self-register (R.1.1). Admin accounts are created
// separately/manually — never through the public register endpoint.
const roleModelMap = { Restaurant, EventOrganizer, NGO };

// @desc    Register a restaurant, event organizer, or NGO
// @route   POST /api/auth/register
// @access  Public
const registerUser = asyncHandler(async (req, res) => {
    const { role, name, email, password } = req.body;

    if (!name || !email || !password || !role) {
        res.status(400);
        throw new Error("name, email, password, and role are required.");
    }

    const Model = roleModelMap[role];
    if (!Model) {
        res.status(400);
        throw new Error(`Invalid role "${role}". Must be one of: ${Object.keys(roleModelMap).join(", ")}.`);
    }

    const existingUser = await User.findOne({ email });
    if (existingUser) {
        res.status(409);
        throw new Error("An account with this email already exists.");
    }

    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);

    // Whitelist allowed fields to prevent Mass Assignment vulnerabilities
    const allowedBase = { 
        name, 
        email, 
        password: hashedPassword, 
        phone: req.body.phone, 
        address: req.body.address 
    };
    
    let roleSpecificFields = {};
    if (role === "Restaurant") {
        roleSpecificFields = {
            organizationName: req.body.organizationName,
            location: req.body.location,
            licenseNo: req.body.licenseNo
        };
    } else if (role === "EventOrganizer") {
        roleSpecificFields = {
            organizationName: req.body.organizationName,
            location: req.body.location,
            eventType: req.body.eventType
        };
    } else if (role === "NGO") {
        roleSpecificFields = {
            ngoName: req.body.ngoName,
            registrationNo: req.body.registrationNo
        };
    }

    const newUser = await Model.create({
        ...allowedBase,
        ...roleSpecificFields,
    });

    res.status(201).json({
        message: "Registration successful. Your account is pending verification.",
        status: newUser.verificationStatus,
    });
});


// @desc    Login and receive a JWT
// @route   POST /api/auth/login
// @access  Public
const loginUser = asyncHandler(async (req, res) => {
    const { email, password } = req.body;

    if (!email || !password) {
        res.status(400);
        throw new Error("email and password are required.");
    }

    // Query the base User model — matches regardless of role
    const user = await User.findOne({ email });
    if (!user) {
        res.status(401);
        throw new Error("Invalid email or password.");
    }

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
        res.status(401);
        throw new Error("Invalid email or password.");
    }

    // Only Admins can log in before verification
    if (user.role !== "Admin" && user.verificationStatus !== "Verified") {
        res.status(403);
        throw new Error(`Your account is currently "${user.verificationStatus}". Please wait for admin approval before logging in.`);
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
});

// @desc    Get logged-in user's profile
// @route   GET /api/auth/me
// @access  Private
const getMe = asyncHandler(async (req, res) => {
    // req.user is set by the auth middleware
    const user = await User.findById(req.user.id).select("-password");

    if (!user) {
        res.status(404);
        throw new Error("User not found.");
    }

    res.status(200).json({ user });
});

const updateProfile = asyncHandler(async (req, res) => {
    const { name, phone, address, organizationName, location, licenseNo, eventType, ngoName, registrationNo } = req.body;
    
    // Whitelist only safe, non-sensitive fields for updating
    const updates = {};
    if (name !== undefined) updates.name = name;
    if (phone !== undefined) updates.phone = phone;
    if (address !== undefined) updates.address = address;
    if (organizationName !== undefined) updates.organizationName = organizationName;
    if (location !== undefined) updates.location = location;
    if (licenseNo !== undefined) updates.licenseNo = licenseNo;
    if (eventType !== undefined) updates.eventType = eventType;
    if (ngoName !== undefined) updates.ngoName = ngoName;
    if (registrationNo !== undefined) updates.registrationNo = registrationNo;

    await User.findByIdAndUpdate(req.user._id, updates, {
        new: true,
        runValidators: true,
    }).select("-password");

    res.status(200).json({ message: "Profile updated successfully" });
});

const logoutUser = asyncHandler(async (req, res) => {
    // JWT is stateless — there's nothing to delete server-side.
    res.status(200).json({ message: "Logged out successfully" });
});



module.exports = {
    registerUser,
    loginUser,
    getMe,
    updateProfile,
    logoutUser,
};
