const express = require('express');
const User = require('../models/Users');
const City = require('../models/Cities');
const State = require('../models/States');
const path = require('path');
const router = express.Router();

router.get('/calculate', async (req,res) =>{
    if(req.isAuthenticated()){
        res.sendFile(path.join(__dirname, '../public', 'calculate.html'));
    }
    else{
        res.redirect('/login');
    }
});
  
router.get('/location', async (req,res) => {
    if(req.isAuthenticated()){
        try {

        const apikey = `${process.env.API_KEY}`;
        const latitude = req.query.lat;
        const longitude = req.query.lon;

        const apiURL = `https://api.openweathermap.org/geo/1.0/reverse?lat=${latitude}&lon=${longitude}&limit=1&appid=${apikey}`;
        const response = await fetch(apiURL);
        const result = await response.json();
        
        res.json(result);

        } catch (error) {
        console.error(error);
        res.status(500).send('Server error');
        }
    }
    else{
        res.redirect('/login');
    }
})
  
router.post('/calculate', async (req,res) =>{
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

module.exports = router;
