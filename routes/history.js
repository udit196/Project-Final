const express = require('express');
const User = require('../models/Users');
const router = express.Router();

router.get('/history', (req, res) => {
  if (req.isAuthenticated()) {
    res.render('history');
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
router.get('/details/:id', async (req, res) => {
  if(req.isAuthenticated()){
    try {
      const emissionId = req.params.id;
  
      // Find the user with the specified emission
      const user = await User.findOne({ 'emissions._id': emissionId });
  
      if (!user) {
        return res.status(404).send('Emission not found');
      }
  
      // Extract the specific emission using Mongoose's subdocument .id() method
      const emission = user.emissions.id(emissionId);
  
      if (!emission) {
        return res.status(404).send('Emission details not found');
      }
  
      // Send or render the specific emission details
      res.render('details', { details: emission });
    } catch (error) {
      console.error(error);
      res.status(500).send('Server error');
    }
  }
  else{
    res.redirect('/login');
  }
});

module.exports = router;
