const mongoose = require('mongoose');

const userSchema={
    username:String,
    name:String,
    password:String,
    emissions:[{
        ElectricityEmissions:String,
        TransportationEmissions:String,
        AirTravelEmissionsShortHaul:String,
        AirTravelEmissionsMediumHaul:String,
        AirTravelEmissionsLongHaul:String,
        TotalAirTravelEmissions:String,
        YearlyElectricityEmissions:String,
        YearlyTransportationEmissions:String,
        DietaryChoiceEmissions:String,
        TotalYearlyEmissions:String,
        // Date:String,
        // Time:String,
        Message:String,
        Timestamp: { type: Date, default: Date.now }
    }]
};

module.exports = mongoose.model("User",userSchema);
