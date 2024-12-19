const express = require('express');
const User = require('../models/Users');
const City = require('../models/Cities');
const State = require('../models/States');
const path = require('path');
const router = express.Router();

router.get('/profile', async (req, res) => {
  if(req.isAuthenticated()){
    res.sendFile(path.join(__dirname, '../public', 'profile.html'));
  }
  else{
    res.redirect('/login');
  }
});

router.get('/api/user', async (req,res) =>{
  if(req.isAuthenticated()){
    const user = await User.findOne({ _id:req.session.passport.user});
    res.json(user);
  }
  else{
    res.status(401).json({error: 'Unauthorized'});
  }
})

module.exports = router;
