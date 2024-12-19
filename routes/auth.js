const express = require('express');
const passport = require('../auth/passportConfig');
const User = require('../models/Users');
const path = require('path');
const router = express.Router();

// Login route
router.get('/login', (req, res) => {
    res.sendFile(path.join(__dirname, '../public', 'login.html'));
});

router.post(
  '/login',
  passport.authenticate('local', { failureRedirect: '/' }),
  (req, res) => {
    res.redirect('/profile');
  }
);

// Register route
router.get('/register', (req, res) => {
  res.sendFile(path.join(__dirname, '../public', 'register.html'));
});

router.post('/register', async (req, res) => {
  const { username, name, gender, password } = req.body;

  try {
    const existingUser = await User.findOne({ username });
    if (!existingUser) {
      const newUser = new User({ username, name, gender, password });
      await newUser.save();

      req.login(newUser, (err) => {
        if (err) {
          console.log('Error:', err);
          return res.redirect('/register');
        }
        return res.redirect('/profile');
      });
    } else {
      res.redirect('/register');
    }
  } catch (err) {
    console.error(err);
    res.redirect('/register');
  }
});

//Handling user logout------------------------------------------------------------------------------

router.get('/logout', (req, res) => {
    req.logout((err) => {
      if (err) return next(err);
      res.redirect('/');
    });
  });

module.exports = router;