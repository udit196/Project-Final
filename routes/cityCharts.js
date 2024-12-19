const express = require('express');
const State = require('../models/States');
const City = require('../models/Cities');
const path = require('path');
const router = express.Router();
  
// For City Charts-------------------------------------------------------------------------------
router.get('/CityCharts', async (req,res) => {
    if(req.isAuthenticated()){
        res.sendFile(path.join(__dirname, '../public', 'CityChart.html'));
    }
    else{
        res.redirect('/login');
    }
})
  
router.get('/city-emissions', async (req, res) => {
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
  
router.get('/available-states', async (req,res) => {
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

module.exports = router;
