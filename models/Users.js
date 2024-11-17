const mongoose = require('mongoose');

const userSchema={
    username:String,
    name:String,
    password:String,
    emissions:[]
};

module.exports = mongoose.model("User",userSchema);
