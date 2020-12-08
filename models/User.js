const mongoose = require("mongoose");


const UserSchema = mongoose.Schema({
    username: { 
        type: String,
        required: true 
    },
    password: { 
        type: String,
        required: true 
    },
    pronoun: {
        type: String,
        required: false
    },
    profilePic: {
        type: String,
        required: false
    },
    description: {
        type: String,
        required: false
    },
    links: {
        type: Array,
        required: false
    },
    date: { type: Date, default: Date.now }
});


module.exports = mongoose.model("Users", UserSchema);