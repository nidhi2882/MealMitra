const mongoose = require("mongoose");
const User = require("./User");

//No extra fields in admin

const adminSchema = new mongoose.Schema({});
const Admin = User.discriminator("Admin",adminSchema);
module.exports = Admin;