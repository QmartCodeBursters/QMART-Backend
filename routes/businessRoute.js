const express = require('express');
const businessController = require('../controllers/businessController');
const businesRouter = express.Router();


businesRouter.post('/business-registration', businessController);

module.exports =  businesRouter 
