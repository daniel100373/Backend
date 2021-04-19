const mongoose = require("mongoose");

const userSchema = new mongoose.Schema({
    email: {
        type: String,
    },
    password: {
        type: String,
    },
    studentId: {
        type: String,
    },
    username: {
        type: String,
    },
});

const User = mongoose.model("User", userSchema);
module.exports = User;
