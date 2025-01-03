const mongoose = require('mongoose');

const withdrawalDeailsSchema = new mongoose.Schema({
    userId : {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },
    bankName : {
        type: String,
        required: true
    },
    accountName: {
        type: String,
        required: true
    },
    accountNumber: {
        type: String,
        required: true,
        minlength: 10,
        maxlegth: 10
    },
    pin: {
        type: String,
        required: true,
        minlength: 4,
        maxlength: 4
    }
},{
    timestamps: true
})

module.exports = mongoose.model('withdrawalDetails', withdrawalDeailsSchema)

