const express = require('express');
const User = require('../models/Users');
const path = require('path');
const router = express.Router();

router.get('/history', (req, res) => {
  if (req.isAuthenticated()) {
    res.sendFile(path.join(__dirname, '../public', 'history.html'));
  } else {
    res.redirect('/login');
  }
});

router.get('/api/history', async (req, res) => {
  if (req.isAuthenticated()) {
    const user = await User.findById(req.session.passport.user);
    res.json(user.emissions);
  } else {
    res.redirect('/login');
  }
});

// Metadata Page------------------------------------------------------------------------------------
router.get('/details', async (req, res) => {
  if (req.isAuthenticated()) {
    res.sendFile(path.join(__dirname, '../public', 'details.html'));
  } else {
    res.redirect('/login');
  }
});

router.get('/fulldetails/:id', async (req, res) => {
  if (req.isAuthenticated()) {
    try {
      const emissionId = req.params.id;
  
      const user =await User.findById(req.session.passport.user);
  
      if (!user) {
        return res.status(404).send('Emission not found');
      }
  
      const emission = user.emissions.id(emissionId);
  
      if (!emission) {
        return res.status(404).send('Emission details not found');
      }
  
      res.json(emission);
    } catch (error) {
      console.error(error);
      res.status(500).send('Server error');
    }
  } else {
    res.redirect('/login');
  }
});

module.exports = router;
