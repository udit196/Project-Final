const express = require('express');
const User = require('../models/Users');
const City = require('../models/Cities');
const State = require('../models/States');
const path = require('path');
const multer = require('multer');
const storage = multer.memoryStorage();
const upload = multer({ storage: storage });
const router = express.Router();

router.get('/profile', async (req, res) => {
  if(req.isAuthenticated()){
    res.sendFile(path.join(__dirname, '../public', 'profile.html'));
  }
  else{
    res.redirect('/login');
  }
});

//Image upload--------------------------------------------------------------------------------------
router.post('/upload-image', upload.single('image'), async (req, res) => {
  try {
    const user = await User.findById(req.session.passport.user);

    user.profilePicture = req.file.buffer;
    await user.save();

    res.status(200).send({ message: 'Image uploaded successfully' });
  } catch (error) {
    console.error('Error uploading image:', error);
    res.status(500).send({ message: 'Error uploading image' });
  }
});

router.get('/api/user', async (req,res) =>{
  if(req.isAuthenticated()){
    const user = await User.findById(req.session.passport.user);
    res.json(user);
  }
  else{
    res.status(401).json({error: 'Unauthorized'});
  }
})

router.get('/api/profile-picture', async (req, res) => {
  try {
    const user = await User.findById(req.session.passport.user);

    // Send the binary image as Base64
    res.set('Content-Type', 'image/png'); // Change to the appropriate format if necessary
    res.send(user.profilePicture);
  } catch (error) {
    console.error('Error fetching profile picture:', error);
    res.status(500).send({ message: 'Error fetching profile picture' });
  }
});


module.exports = router;
