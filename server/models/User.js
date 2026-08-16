const mongoose = require("mongoose");

// discriminatorKey "role" is how MongoDB knows which subtype
// (Admin / Restaurant / EventOrganizer / NGO) a given document belongs to.
//
// NOTE: Mongoose only supports ONE LEVEL of discriminators — a discriminator
// cannot itself be a base for further discriminators. Your ERD draws
// USER -> DONOR -> (RESTAURANT | EVENT_ORGANIZER) as two inheritance levels,
// so we flatten it to one level: USER -> (Admin | NGO | Restaurant | EventOrganizer),
// and Restaurant/EventOrganizer each carry the Donor fields (organizationName,
// location) directly. Same data shape, just one less hop. See donorFields.js.

const options = {discriminatorKey: "role",timestamp: true};

const userSchema = new mongoose.Schema(
    {
        name: {type:String, required:true},
        email:{type:String, required: true,unique: true,lowercase:true,trim:true},
        password:{type:String,required:true},
        verificationStatus:{
            type:String,
            enum: ["Pending","Verified","Rejected"],
            default:"Pending",
        },
    },
    options
);

const User = mongoose.model("User",userSchema);
module.exports = User;