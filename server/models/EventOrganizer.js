const mongoose = require("mongoose");
const User = require("./User");

const eventOrganizerSchema = new mongoose.Schema(
    {
        organizationName : {type:String,required:true},
        location: {type:String,required:true},
        eventType:{type:String},
    }
);
const EventOrganizer = User.discriminator("EventOrganizer",eventOrganizerSchema);
module.exports = EventOrganizer;