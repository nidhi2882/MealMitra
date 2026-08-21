const jwt = require("jsonwebtoken");
const User = require("../models/User");

// Runs BEFORE any protected controller. Checks the Authorization header,
// verifies the JWT, and attaches the full user document to req.user so
// every controller after this can just read req.user directly.
const protect = async (req, res, next) => {
    let token;

    const authHeader = req.headers.authorization;
    if (authHeader && authHeader.startsWith("Bearer ")) {
        token = authHeader.split(" ")[1];
    }

    if (!token) {
        return res.status(401).json({ message: "Not authorized. No token provided." });
    }

    try {
        const decoded = jwt.verify(token, process.env.JWT_SECRET);

        const user = await User.findById(decoded.id).select("-password");
        if (!user) {
            return res.status(401).json({ message: "Not authorized. User no longer exists." });
        }

        req.user = user;
        next();
    } catch (err) {
        return res.status(401).json({ message: "Not authorized. Token invalid or expired." });
    }
};

module.exports = { protect };
