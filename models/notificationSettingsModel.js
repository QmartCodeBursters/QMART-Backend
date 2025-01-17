// models/NotificationSettings.js
const mongoose = require("mongoose");

const notificationSettingsSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId, 
    ref: "User", 
    required: true 
},
  role: { 
    type: String, 
    enum: ["customer", "merchant"], 
    required: true 
},
  notificationsEnabled: { 
    type: Boolean, 
    default: true 
},
  emailEnabled: { 
    type: Boolean, 
    default: true 
},
  smsEnabled: { 
    type: Boolean, 
    default: true 
},
  paymentsEnabled: { 
    type: Boolean, 
    default: true 
},
  withdrawalsEnabled: { 
    type: Boolean, 
    default: true 
},
  newslettersEnabled: { 
    type: Boolean, 
    default: true 
},
  updatesEnabled: { 
    type: Boolean, 
    default: true 
},
});

const NotificationSettings = mongoose.model("NotificationSettings", notificationSettingsSchema);

module.exports = NotificationSettings;
