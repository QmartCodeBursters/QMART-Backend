const mongoose = require('mongoose');

const walletSettingsSchema = new mongoose.Schema({
    userId : {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },
    pin: {
        type: String,
        required: true,
        maxlength: 255,
        minlength: 4
    }
});

module.exports = mongoose.model('walletSettings', walletSettingsSchema);