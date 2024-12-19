const express = require('express');
const State = require('../models/States');
const City = require('../models/Cities');
const path = require('path');
const router = express.Router();

router.get('/StateCharts', async (req,res) => {
    if(req.isAuthenticated()){
      res.sendFile(path.join(__dirname, '../public', 'StateChart.html'));
    }
    else{
      res.redirect('/login');
    }
  })
  
router.get('/state-emissions', async (req, res) => {
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

module.exports = router;
