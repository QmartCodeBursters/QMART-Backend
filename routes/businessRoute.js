const express = require('express');
const businessController = require('../controllers/businessController');
const businesRouter = express.Router();
const authenticateUser = require('../middlewares/authMiddleware');

businesRouter.post('/business-registration', authenticateUser, businessController);

module.exports =  businesRouter 
