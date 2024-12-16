const mongoose = require('mongoose');

const PlaceSchema={
    name:String,
    type:String, // State or City
    count:Number, //Number of Samples

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

module.exports = mongoose.model("Place",PlaceSchema);