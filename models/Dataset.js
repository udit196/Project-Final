const mongoose = require('mongoose');

const dataSchema={
    username:String,
    name:String,

    emissions:{
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
        Message:String,
        Timestamp: { type: Date, default: Date.now }
    }
};

module.exports = mongoose.model("dataset",dataSchema);
