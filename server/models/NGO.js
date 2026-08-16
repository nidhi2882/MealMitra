const mongoose = require("mongoose");
const User = require("./User");

const ngoSchema = new mongoose.Schema(
    {
        ngoName: {type:String,required:true},
        registrationNo: {type:String,required:true},
    }
);
const NGO = User.discriminator("NGO",ngoSchema);
module.exports = NGO;