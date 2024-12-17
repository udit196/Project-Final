const mongoose = require('mongoose');

const CitySchema={
    name:String,
    statename:String,
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

module.exports = mongoose.model("City",CitySchema);