const mongoose = require('mongoose');	
const businessModel = require('../models/businessModel');
const userModel = require('../models/userModel');


async function businessController(request, response) {
    try {
        const { email } = request.user;
        
        const user = await userModel.findOne({email});

        if(!user) {
            return response.status(404).json({
                message: "User not found.",
                error: true,
                success: false
            });
        }

        if(user.role !== "merchant") {
            return response.status(403).json({
                message: "Access denied, only merchants can register buiseness.",
                error: true,
                success: false
            });
        }
        
        const {businessName, businessRegNumber, businessDescription} = request.body;

        if(!businessName) {
            return response.status(400).json({
                message: "Business name is required.",
                error: true,
                success: false
            })
        }

        const newBusiness = new businessModel({
            businessName,
            businessRegNumber,
            businessDescription,
            user: user._id  
        });

        await newBusiness.save();

        return response.status(201).json({
            message: "Business registered successfully.",
            data: {
                newBusiness,
                userData: user
            },
            error: false,
            success: true
        });

    } catch (error) {
      return response.status(500).json({
        message: error.message || error,
        error: true,
        success: false
      })
    }
}

module.exports = businessController;

