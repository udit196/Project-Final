const mongoose = require('mongoose');

const StateSchema={
    name:String,
    count:Number,

    ElectricityEmissions:Number,
    TransportationEmissions:Number,
    AirTravelEmissionsShortHaul:Number,
    AirTravelEmissionsMediumHaul:Number,
    AirTravelEmissionsLongHaul:Number,
    TotalAirTravelEmissions:Number,
    YearlyElectricityEmissions:Number,
    YearlyTransportationEmissions:Number,
    DietaryChoiceEmissions:Number,
    TotalYearlyEmissions:Number
};

module.exports = mongoose.model("State",StateSchema);