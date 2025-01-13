const express = require('express');
const businessController = require('../controllers/businessController');
const authenticateUser = require('../middlewares/authMiddleware');
const businesRouter = express.Router();


businesRouter.post('/business-registration', authenticateUser, businessController.registerBusiness);

module.exports =  businesRouter 
