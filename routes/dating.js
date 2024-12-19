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

module.exports = router;