const NotificationSettings = require("../models/notificationSettingsModel");


// Get notification settings for a user or merchant
exports.getNotificationSettings = async (req, res) => {
  const { userId, role } = req.params;

  try {
    const settings = await NotificationSettings.findOne({ userId, role });
    if (!settings) {
      return res.status(404).json({ 
        message: error.message || "Settings not found",
        error: true,
        success: false, 
    });
    }

    res.status(200).json(settings);
  } catch (error) {
    res.status(500).json({ 
        message: error.message || "Server error", 
        error: true,
        success: false
     });
  }
};

// Update notification settings
exports.updateNotificationSettings = async (req, res) => {
  const { userId, role } = req.params;
  const updates = req.body;

  try {
    const settings = await NotificationSettings.findOneAndUpdate(
      { userId, role },
      updates,
      { new: true, upsert: true } // Create if not exists
    );

    res.status(200).json({ 
        message: error.message || "Settings updated successfully", 
        settings 
    });
  } catch (error) {
    res.status(500).json({ 
        message: error.message || "Server error", 
        error: true,
        success: false });
  }
};
