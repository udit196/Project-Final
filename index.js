const express = require('express');
const mongoose = require('mongoose');   
const bodyParser = require('body-parser');  
const flash = require('connect-flash');
const session = require('express-session')
require('dotenv').config('./.env');

const app = express();

// Models
const User = require('./models/Users');
const passport = require('./auth/passportConfig');


// Atlas key
const url='mongodb://127.0.0.1:27017/carbon_emissions';
mongoose.connect(url);

app.set('view engine', 'ejs');
app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.json());

app.use(session({
  secret: process.env.SESSION_SECRET,
  resave: false,
  saveUninitialized: false
}));


app.use(flash());
app.use(passport.initialize());
app.use(passport.session());
app.use(express.static('public'));


app.get('/', function (req, res) {
  res.render('get-started',{backButton:'back-button.png',imageFileName:'BgHome.jpg'});
});

// router for login-register form---------------------------------------------------------------------------- 
app.get('/login', function (req, res) {
  res.render('login');
});

app.post('/login', 
  passport.authenticate('local', { failureRedirect: '/'}),
  async function(req, res) {
    const username = req.body.username;
    const user = await User.findOne({ username });
    req.session.name = user.name;
    req.session.user = req.body.username;
    res.redirect('/profile');
  });

// register page--------------------------------------------------------------------------------------- 
app.get('/register' , function(req,res){
  res.render('register',{errorMessage: req.flash('error'), successMessage: req.flash('success')});
});

app.post("/register", async (req,res)=>{
  const { username, name, password } = req.body;
  
  try {
    const existingUser = await User.findOne({ username });
    if (!existingUser) {
        const newUser = new User({
          username,
          name,
          password
        });

        await newUser.save();

      req.login(newUser, function(err) {
        if (err) {
          console.log('Error: ', err);
          return res.redirect('register');
        }
        req.session.name = req.body.name;
        req.session.user = req.body.username;
        return res.redirect('/profile');
      });
    } else {
      req.flash('error', 'User already exists with this email');
      return res.redirect('/register');
    }
  } catch (err) {
    console.error(err);
    req.flash('error', 'An error occurred while Signing In');
  }
});

//Calculate page----------------------------------------------------------------------------------------
app.get('/calculate', async (req,res) =>{
  if(req.isAuthenticated()){
    res.render('calculate');
  }
  else{
    res.redirect('/login');
  }
});

app.post('/calculate', async (req,res) =>{
  if(req.isAuthenticated()){
    
    try{
      // console.log(req.body)
      const {
      electricityUsageKWh,
      transportationUsageGallonsPerMonth,
      flightsShortHaul,
      flightsMediumHaul,
      flightsLongHaul,
      dietaryChoice
    } = req.body;
    
    const electricityFactor = 0.3978;
    const transportationFactor = 9.087;
    const kgCO2ePerYearFactor = 12;
    const airTravelFactorShortHaul = 100;
    const airTravelFactorMediumHaul = 200;
    const airTravelFactorLongHaul = 300;
    const dietaryFactors = {
      Vegan: 200,
      Vegetarian: 400,
      Pescatarian: 600,
      MeatEater: 800
    };
    
    const electricityEmissions = parseFloat( electricityUsageKWh) * electricityFactor;
    const transportationEmissions = parseFloat(transportationUsageGallonsPerMonth) * transportationFactor;
    const airTravelEmissionsShortHaul =parseFloat( flightsShortHaul) * airTravelFactorShortHaul;
    const airTravelEmissionsMediumHaul = parseFloat(flightsMediumHaul) * airTravelFactorMediumHaul;
    const airTravelEmissionsLongHaul = parseFloat(flightsLongHaul) * airTravelFactorLongHaul;
    const dietaryChoiceEmissions = dietaryFactors[parseFloat(dietaryChoice)] || 0;
    
    const totalAirTravelEmissions = parseFloat(airTravelEmissionsShortHaul) + airTravelEmissionsMediumHaul + airTravelEmissionsLongHaul;
    const yearlyElectricityEmissions =parseFloat( electricityEmissions) * kgCO2ePerYearFactor;
    const yearlyTransportationEmissions = parseFloat(transportationEmissions) * kgCO2ePerYearFactor;
    const totalYearlyEmissions = yearlyElectricityEmissions + yearlyTransportationEmissions + totalAirTravelEmissions + dietaryChoiceEmissions;
     
    const timestamp = new Date();
    var curr_chat_date = new Date(timestamp);
    var curr_only_date = curr_chat_date.getDate().toString().padStart(2, '0');
    var curr_only_month = (curr_chat_date.getMonth() + 1).toString().padStart(2, '0');
    var curr_only_year = curr_chat_date.getFullYear().toString();
    var hours = curr_chat_date.getHours().toString().padStart(2, '0');
    var minutes = curr_chat_date.getMinutes().toString().padStart(2, '0');
    var time = `${hours}:${minutes}`;
    var curr_date = `${curr_only_year}-${curr_only_month}-${curr_only_date}`;
    var curr_rev_date = `${curr_only_date}-${curr_only_month}-${curr_only_year}`;

    var message = "Your Emissions are under limit. You can reduce them even further.";

    if(totalYearlyEmissions > 4000){
      message = "You must try to reduce the Carbon emissions for a better tommorow."
    }

    const result = {
      ElectricityEmissions:electricityEmissions,
      TransportationEmissions:transportationEmissions,
      AirTravelEmissionsShortHaul:airTravelEmissionsShortHaul,
      AirTravelEmissionsMediumHaul:airTravelEmissionsMediumHaul,
      AirTravelEmissionsLongHaul:airTravelEmissionsLongHaul,
      TotalAirTravelEmissions:totalAirTravelEmissions,
      YearlyElectricityEmissions:yearlyElectricityEmissions,
      YearlyTransportationEmissions:yearlyTransportationEmissions,
      DietaryChoiceEmissions:dietaryChoiceEmissions,
      TotalYearlyEmissions:totalYearlyEmissions,
      Date:curr_rev_date,
      Time:time,
      Message:message
    };
    
    const user =await User.findOne({username:req.session.user})
    user.emissions.push(result);
    await user.save();
    res.status(200).json(JSON.stringify(result));
    
  } catch (err) {
    console.error('Error calculating CO2 emissions:', err);
    res.status(500).json({ error: 'Internal server error' });
  }
}
else{
  res.redirect('/login');
}
});

// Profile Page------------------------------------------------------------------------------------
app.get('/profile', async (req, res) => {
  if(req.isAuthenticated()){
    const user = await User.findOne({ username: req.session.user });
    res.render('profile', {user:user});
  }
  else{
    res.redirect('/login');
  }
});

// History Page------------------------------------------------------------------------------------
app.get('/history', async (req, res) => {
  if(req.isAuthenticated()){
    const user = await User.findOne({ username: req.session.user });
    const history = user.emissions; // Get the emissions array
    res.render('history', { history: history});
  }
  else{
    res.redirect('/login');
  }
});


// Metadata Page------------------------------------------------------------------------------------
app.get('/details/:id', async (req, res) => {
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


    // const id = req.params.id;
    // const user = await User.findOne({ username: req.session.user });
    // const metadata = user.emissions.findById(id); // Get the emissions array
    // res.render('details', { metadata: metadata});
  }
  else{
    res.redirect('/login');
  }
});

//Handling user logout------------------------------------------------------------------------------

app.get('/logout', (req, res) => {
  req.logout((err) => {
    if (err) return next(err);
    res.redirect('/');
  });
});

// ------------------------------------------------------------------------------------------------------
var port = process.env.PORT || 3000;
app.listen(port, function () {
  console.log("Server Has Started!");
});