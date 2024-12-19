const express = require('express');
const User = require('../models/Users');
const City = require('../models/Cities');
const State = require('../models/States');
const path = require('path');
const router = express.Router();

router.get('/funGame', async (req, res) => {
  if(req.isAuthenticated()){
    res.sendFile(path.join(__dirname, '../public', 'dating.html'));
  }
  else{
    res.redirect('/login');
  }
});

router.get('/api/user-emissions', async (req,res) => {
  if(req.isAuthenticated()){
    const user = await User.findById(req.session.passport.user);
    res.json(user);
  }
  else{
    res.redirect('/login');
  }
})

router.get('/api/search-soulmate', async (req,res) => {
  if(req.isAuthenticated()){
    const low = req.query.lower;
    const high = req.query.upper;
    const user = await User.findById(req.session.passport.user);
    const user_gender = user.gender;
    var search_gender;
    if(user_gender === 'male'){
      search_gender = 'female';
    }
    else{
      search_gender = 'male';
    }
    const result = await User.find({gender: search_gender, 'latest_emissions.TotalYearlyEmissions':{ $gte: low, $lte: high }});
    res.json(result);
  }
  else{
    res.redirect('/login');
  }
});

module.exports = router;