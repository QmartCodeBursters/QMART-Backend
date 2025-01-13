const mongoose = require('mongoose');	
const businessModel = require('../models/businessModel');
const userModel = require('../models/userModel');

// Register Business
const registerBusiness = async (req, res) => {
    try {
        const { _id } = req.user;

        // Find the user
        const user = await userModel.findById(_id);
        
        if (!user) {
            return res.status(404).json({
                message: "User not found.",
                error: true,
                success: false
            });
        }

        // Only merchants can register a business
        if (user.role !== "merchant") {
            return res.status(403).json({
                message: "Access denied, only merchants can register a business.",
                error: true,
                success: false
            });
        }

        // Check if the user already has a registered business
        if (user.businessName) {
            return res.status(400).json({
                message: "Business already registered with this account.",
                error: true,
                success: false
            });
        }
        
        const { businessName, businessRegNumber, businessDescription } = req.body;

        if (!businessName) {
            return res.status(400).json({
                message: "Business name is required.",
                error: true,
                success: false
            });
        }

        // Check if the business name is already in use
        const existingBusiness = await businessModel.findOne({ businessName });
        if (existingBusiness) {
            return res.status(400).json({
                message: "Business name is already in use.",
                error: true,
                success: false
            });
        }

        // Create new business
        const newBusiness = new businessModel({
            businessName,
            businessRegNumber,
            businessDescription,
            user: user._id  // Link business to user
        });

        await newBusiness.save();

        // Update user with the registered business
        user.businessName = businessName;
        user.business = newBusiness._id;  // Store business reference in user model
        await user.save();

        return res.status(201).json({
            message: "Business registered successfully.",
            data: {
                newBusiness,
                userData: user
            },
            error: false,
            success: true
        });

    } catch (error) {
        return res.status(500).json({
            message: error.message || error,
            error: true,
            success: false
        });
    }
};


// const fetchUserData = async (req, res) => {
//     try {
//       // Fetch the user and populate the 'business' field
//       const user = await userModel.findById(req.user.id).populate('business');
//       console.log(user)
//       if (!user) {
//         return res.status(404).json({ message: "User not found" });
//       }
  
//       res.status(200).json({
//         role: user.role,
//         businessName: user.business ? user.business.businessName : null,
//         accountBalance: user.accountBalance,
//       });
//     } catch (error) {
//       console.error(error);
//       res.status(500).json({ message: "Server error" });
//     }
//   };

// Export the function
module.exports = {
    registerBusiness,
    // fetchUserData
 };
