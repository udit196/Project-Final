const express = require('express');
const mongoose = require('mongoose');   
const bodyParser = require('body-parser');  
// const flash = require('connect-flash');
const session = require('express-session')
const path = require('path');
require('dotenv').config('./.env');

const url=process.env.url;
const passport = require('./auth/passportConfig');

const app = express();
mongoose.connect(url);

// Middleware
app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.json());
app.use(session({
  secret: process.env.SESSION_SECRET,
  resave: false,
  saveUninitialized: false
}));

// app.use(flash());
app.use(passport.initialize());
app.use(passport.session());
app.use(express.static('public'));

// Import routes
const authRoutes = require('./routes/auth');
const profileRoutes = require('./routes/profile');
const calculateRoutes = require('./routes/calculate');
const historyRoutes = require('./routes/history');
const stateChartRoutes = require('./routes/stateCharts');
const cityChartRoutes = require('./routes/cityCharts');
const datingRoutes = require('./routes/dating');

// Use routes
app.use(authRoutes);
app.use(profileRoutes);
app.use(calculateRoutes);
app.use(historyRoutes);
app.use(stateChartRoutes);
app.use(cityChartRoutes);
app.use(datingRoutes);

app.get('/', function (req, res) {
  res.sendFile(path.join(__dirname, 'public', 'get-started.html'));
});

// ------------------------------------------------------------------------------------------------------
var port = process.env.PORT || 3000;
app.listen(port, function () {
  console.log("Server Has Started!");
});