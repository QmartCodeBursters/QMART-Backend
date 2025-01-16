const mongoose = require("mongoose");

const businessSchema = new mongoose.Schema({
    businessName: {
        type: String, 
        required: true
    },
    businessRegNumber: {
        type: String, 
    },
    businessDescription: {
        type: String, 
    },
 
});

const businessModel = mongoose.model("Business", businessSchema);

module.exports = businessModel;
