const express = require('express');
const businessController = require('../controllers/businessController');
const authenticateUser = require('../middlewares/authMiddleware');
const { generateQRCode } = require('../utils/qRcodeGenerate');

const businesRouter = express.Router();


businesRouter.post('/business-registration', authenticateUser, businessController.registerBusiness);
businesRouter.post('/generate-qr-code', authenticateUser, generateQRCode);
businesRouter.get('/merchant-details', authenticateUser, businessController.fetchMerchantData)

module.exports =  businesRouter 
