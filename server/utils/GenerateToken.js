const jwt = require("jsonwebtoken");

// Signs a token containing the user's id and role.
// role is included so the frontend/middleware can make quick decisions
// without an extra DB lookup on every single request.
const generateToken = (id, role) => {
    return jwt.sign({ id, role }, process.env.JWT_SECRET, {
        expiresIn: process.env.JWT_EXPIRES_IN || "7d",
    });
};

module.exports = generateToken;