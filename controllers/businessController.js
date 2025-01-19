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

        // Create new business with the same accountNumber as the user
        const newBusiness = new businessModel({
            businessName,
            businessRegNumber,
            businessDescription,
            accountNumber: user.accountNumber,  // Use the user's account number for the business
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



const fetchMerchantData = async (req, res) => {
    try {
        // Ensure req.user exists
        if (!req.user || !req.user._id) {
            return res.status(400).json({ message: "User is not authenticated" });
        }

        // Fetch the user and populate the 'business' field
        const user = await userModel.findById(req.user._id).populate('business');
        
        // Check if user exists
        if (!user) {
            return res.status(404).json({ message: "User not found" });
        }

        // Ensure business data exists
        const business = user.business ? user.business : null;

        // Return the merchant data
        res.status(200).json({
            role: user.role,
            businessName: business ? business.businessName : "No business name", // Provide a fallback value
            accountNumber: user.accountNumber || "No account number", // Provide a fallback value
            accountBalance: user.accountBalance,
            businessDescription: business ? business.businessDescription : "No business description", // Provide fallback
        });
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: "Server error" });
    }
};

// Export the function
module.exports = {
    registerBusiness,
    fetchMerchantData
 };
