const express = require('express');
const mongoose = require('mongoose');   
const bodyParser = require('body-parser');  
const flash = require('connect-flash');
const session = require('express-session')
require('dotenv').config('./.env');

const app = express();

// Models
const User = require('./models/Users');
const City = require('./models/Cities');
const State = require('./models/States');
const passport = require('./auth/passportConfig');

// Atlas key
// const url='mongodb://127.0.0.1:27017/carbon_emissions';
const url=process.env.url;
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
    // console.log(req.session.passport.user);
    const apikey = `${process.env.API_KEY}`;
    res.render('calculate',{apikey});
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
      dietaryChoice,
      city,
      country
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
      Message:message,
      City:city,
      State:country
    };
    
    const user =await User.findById(req.session.passport.user)
    user.emissions.push(result);

    const oldCity = await City.findOne({name:user.latest_emissions.City});
    const oldState = await State.findOne({name:user.latest_emissions.State});

    // Update old city
    if(user.latest_emissions.City != "default"){
      oldCity.count--;
      oldCity.ElectricityEmissions -= electricityEmissions;
      oldCity.TransportationEmissions -= transportationEmissions;
      oldCity.AirTravelEmissionsShortHaul -= airTravelEmissionsShortHaul;
      oldCity.AirTravelEmissionsMediumHaul -= airTravelEmissionsMediumHaul;
      oldCity.AirTravelEmissionsLongHaul -= airTravelEmissionsLongHaul;
      oldCity.TotalAirTravelEmissions -= totalAirTravelEmissions;
      oldCity.YearlyElectricityEmissions -= yearlyElectricityEmissions;
      oldCity.YearlyTransportationEmissions -= yearlyTransportationEmissions;
      oldCity.DietaryChoiceEmissions -= dietaryChoiceEmissions;
      oldCity.TotalYearlyEmissions -= totalYearlyEmissions;
      await oldCity.save();
    }

    // Update old State
    if(user.latest_emissions.State != "default"){
      oldState.count--;
      oldState.ElectricityEmissions -= electricityEmissions;
      oldState.TransportationEmissions -= transportationEmissions;
      oldState.AirTravelEmissionsShortHaul -= airTravelEmissionsShortHaul;
      oldState.AirTravelEmissionsMediumHaul -= airTravelEmissionsMediumHaul;
      oldState.AirTravelEmissionsLongHaul -= airTravelEmissionsLongHaul;
      oldState.TotalAirTravelEmissions -= totalAirTravelEmissions;
      oldState.YearlyElectricityEmissions -= yearlyElectricityEmissions;
      oldState.YearlyTransportationEmissions -= yearlyTransportationEmissions;
      oldState.DietaryChoiceEmissions -= dietaryChoiceEmissions;
      oldState.TotalYearlyEmissions -= totalYearlyEmissions;
      await oldState.save();
    }
    
    user.latest_emissions = result;
    await user.save();

    const cityz = await City.findOne({name:city});

    if(!cityz){
      const newCity = new City({
        name:city,
        statename:country,
        count:1,
        ElectricityEmissions : electricityEmissions,
        TransportationEmissions : transportationEmissions,
        AirTravelEmissionsShortHaul : airTravelEmissionsShortHaul,
        AirTravelEmissionsMediumHaul : airTravelEmissionsMediumHaul,
        AirTravelEmissionsLongHaul : airTravelEmissionsLongHaul,
        TotalAirTravelEmissions : totalAirTravelEmissions,
        YearlyElectricityEmissions : yearlyElectricityEmissions,
        YearlyTransportationEmissions : yearlyTransportationEmissions,
        DietaryChoiceEmissions : dietaryChoiceEmissions,
        TotalYearlyEmissions : totalYearlyEmissions
      });

      await newCity.save();
    }
    else{
      cityz.count++;
      cityz.ElectricityEmissions += electricityEmissions;
      cityz.TransportationEmissions += transportationEmissions;
      cityz.AirTravelEmissionsShortHaul += airTravelEmissionsShortHaul;
      cityz.AirTravelEmissionsMediumHaul += airTravelEmissionsMediumHaul;
      cityz.AirTravelEmissionsLongHaul += airTravelEmissionsLongHaul;
      cityz.TotalAirTravelEmissions += totalAirTravelEmissions;
      cityz.YearlyElectricityEmissions += yearlyElectricityEmissions;
      cityz.YearlyTransportationEmissions += yearlyTransportationEmissions;
      cityz.DietaryChoiceEmissions += dietaryChoiceEmissions;
      cityz.TotalYearlyEmissions += totalYearlyEmissions;
      await cityz.save();
    }


    const statez = await State.findOne({name:country});

    if(!statez){
      const newState = new State({
        name:country,
        count:1,
        ElectricityEmissions : electricityEmissions,
        TransportationEmissions : transportationEmissions,
        AirTravelEmissionsShortHaul : airTravelEmissionsShortHaul,
        AirTravelEmissionsMediumHaul : airTravelEmissionsMediumHaul,
        AirTravelEmissionsLongHaul : airTravelEmissionsLongHaul,
        TotalAirTravelEmissions : totalAirTravelEmissions,
        YearlyElectricityEmissions : yearlyElectricityEmissions,
        YearlyTransportationEmissions : yearlyTransportationEmissions,
        DietaryChoiceEmissions : dietaryChoiceEmissions,
        TotalYearlyEmissions : totalYearlyEmissions
      });

      await newState.save();
    }
    else{
      statez.count++;
      statez.ElectricityEmissions += electricityEmissions;
      statez.TransportationEmissions += transportationEmissions;
      statez.AirTravelEmissionsShortHaul += airTravelEmissionsShortHaul;
      statez.AirTravelEmissionsMediumHaul += airTravelEmissionsMediumHaul;
      statez.AirTravelEmissionsLongHaul += airTravelEmissionsLongHaul;
      statez.TotalAirTravelEmissions += totalAirTravelEmissions;
      statez.YearlyElectricityEmissions += yearlyElectricityEmissions;
      statez.YearlyTransportationEmissions += yearlyTransportationEmissions;
      statez.DietaryChoiceEmissions += dietaryChoiceEmissions;
      statez.TotalYearlyEmissions += totalYearlyEmissions;
      await statez.save();
    }

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
    const user = await User.findOne({ _id:req.session.passport.user});
    res.render('profile', {user:user});
  }
  else{
    res.redirect('/login');
  }
});

// History Page------------------------------------------------------------------------------------
app.get('/history', async (req, res) => {
  if(req.isAuthenticated()){
    const user = await User.findOne({ _id:req.session.passport.user });
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
  }
  else{
    res.redirect('/login');
  }
});

// For State Charts-------------------------------------------------------------------------------
app.get('/StateCharts', async (req,res) => {
  if(req.isAuthenticated()){
    res.render('StateChart');
  }
  else{
    res.redirect('/login');
  }
})

app.get('/state-emissions', async (req, res) => {
  try {
    // Fetch all state data with type = "State"
    const statesData = await State.find();

    // Map the data into an array of objects with name and total emissions
    const emissionsData = statesData.map(state => ({
      name: state.name, // State name
      totalYearlyEmissions: state.TotalYearlyEmissions, // Total emissions
    }));

    res.json(emissionsData);
  } catch (err) {
    console.error("Error fetching state emissions:", err);
    res.status(500).json({ error: "Error fetching data" });
  }
});


// For City Charts-------------------------------------------------------------------------------
app.get('/CityCharts', async (req,res) => {
  if(req.isAuthenticated()){
    res.render('CityChart');
  }
  else{
    res.redirect('/login');
  }
})

app.get('/city-emissions', async (req, res) => {
  try {
    // Fetch all state data with type = "State"
    const statename = req.query.state;
    const citiesData = await City.find({statename:statename});

    // Map the data into an array of objects with name and total emissions
    const emissionsData = citiesData.map(city => ({
      name: city.name, // City name
      totalYearlyEmissions: city.TotalYearlyEmissions, // Total emissions
    }));

    res.json(emissionsData);
  } catch (err) {
    console.error("Error fetching state emissions:", err);
    res.status(500).json({ error: "Error fetching data" });
  }
});

app.get('/test', (req,res) => {
  res.render('test');
})

app.get('/available-states', async (req,res) => {
  try {
    // Fetch all state data with type = "State"
    const statesData = await State.find();

    // Map the data into an array of objects with State names
    const emissionsData = statesData.map(state => ({
      name: state.name, // State name
    }));

    res.json(emissionsData);
  } catch (err) {
    console.error("Error fetching state emissions:", err);
    res.status(500).json({ error: "Error fetching data" });
  }
})

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