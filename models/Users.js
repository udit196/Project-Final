const mongoose = require('mongoose');

const userSchema={
    username:String,
    name:String,
    gender:String,
    password:String,
    latest_emissions:{
        ElectricityEmissions:{ type: Number, default: 0 },
        TransportationEmissions:{ type: Number, default: 0 },
        AirTravelEmissionsShortHaul:{ type: Number, default: 0 },
        AirTravelEmissionsMediumHaul:{ type: Number, default: 0 },
        AirTravelEmissionsLongHaul:{ type: Number, default: 0 },
        TotalAirTravelEmissions:{ type: Number, default: 0 },
        YearlyElectricityEmissions:{ type: Number, default: 0 },
        YearlyTransportationEmissions:{ type: Number, default: 0 },
        DietaryChoiceEmissions:{ type: Number, default: 0 },
        TotalYearlyEmissions:{ type: Number, default: 0 },
        Message:{ type: String, default: "All Good" },
        City:{type: String, default:"default"},
        State:{type: String, default:"default"},
        Timestamp: { type: Date, default: Date.now }
    },
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
        Message:String,
        Timestamp: { type: Date, default: Date.now }
    }]
};

module.exports = mongoose.model("User",userSchema);
