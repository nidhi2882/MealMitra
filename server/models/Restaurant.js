const mongoose = require("mongoose");
const User = require("./User");

const restaurantSchema = new mongoose.Schema(
    {
        organizationName : {type:String,required: true},
        location: {type:String, required:true},
        licenseNo: {type:String, required:true},
    }
);
const Restaurant = User.discriminator("Restaurant",restaurantSchema);
module.exports = Restaurant;