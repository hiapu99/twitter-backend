const mongoose = require('mongoose');

const userSchema = new mongoose.Schema({
    username: {
        type: String,
        require: true
    },
    fullname: {
        type: String,
        require: true
    },
    password: {
        type: String,
        require: true,
        length: 6
    },
    email: {
        type: String,
        require: true,
        unique: true
    },
    followers: [
        {
            type: mongoose.Schema.Types.ObjectId,
            ref: "User"
        }
    ],
    following: [
        {
            type: mongoose.Schema.Types.ObjectId,
            ref: "User"
        }
    ],
    profileImage: {
        type: String,
        default: ""
    },
    coverImages: {
        type: String,
        default: ""
    },
    bio: {
        type: String,
        default: ""
    },
    link: {
        type: String,
        default: ""
    }

}, {
    timestamps: true
})
module.exports = mongoose.model("User", userSchema)