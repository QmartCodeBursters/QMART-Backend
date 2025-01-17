// routes/notificationRoutes.js
const express = require("express");
const { getNotificationSettings, updateNotificationSettings } = require("../controllers/notificationsController");
const router = express.Router();



router.get("/:userId/:role", getNotificationSettings);


router.put("/:userId/:role", updateNotificationSettings);

module.exports = router;
