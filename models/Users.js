const mongoose = require('mongoose');

const userSchema={
    username:String,
    name:String,
    password:String,
    emissions:[]
    // emissions:[{
        
    //     timestamp: { type: Date, default: Date.now }
    // }]
};

module.exports = mongoose.model("User",userSchema);
