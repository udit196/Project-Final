const express = require('express');
const passport = require('../auth/passportConfig');
const User = require('../models/Users');
const router = express.Router();

// Login route
router.get('/login', (req, res) => {
  res.render('login');
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
  res.render('register', {
    errorMessage: req.flash('error'),
    successMessage: req.flash('success'),
  });
});

router.post('/register', async (req, res) => {
  const { username, name, password } = req.body;

  try {
    const existingUser = await User.findOne({ username });
    if (!existingUser) {
      const newUser = new User({ username, name, password });
      await newUser.save();

      req.login(newUser, (err) => {
        if (err) {
          console.log('Error:', err);
          return res.redirect('/register');
        }
        return res.redirect('/profile');
      });
    } else {
      req.flash('error', 'User already exists with this email');
      res.redirect('/register');
    }
  } catch (err) {
    console.error(err);
    req.flash('error', 'An error occurred while signing in');
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