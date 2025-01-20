const User = require('../models/userModel');
const walletSettings = require('../models/walletSettings');
const bcrypt = require("bcryptjs");

//Get wallet details
exports.getWalletDetails = async (req, res) => {
  try {
    // Fetch the authenticated user based on the token
    const user = await User.findById(req.user._id);
    if (!user) {
      return res.status(404).json({
        message: 'User not found',
        error: true,
        success: false,
      });
    }

    // Structure the wallet details response
    const walletDetails = {
      walletName: `${user.firstName} ${user.lastName}`,
      walletNumber: user.accountNumber,
      balance: user.accountBalance,
      role: user.role,
      
    };

    // Add businessName if the user is a merchant
    if (user.role === 'merchant' && user.businessName) {
      walletDetails.businessName = user.businessName;
    }

    res.status(200).json({
      message: 'Wallet details fetched successfully.',
      data: walletDetails,
      success: true,
    });
  } catch (error) {
    console.error('Error fetching wallet details:', error);
    res.status(500).json({
      message: 'Server error.',
      error: error.message,
      success: false,
    });
  }
};

// Change Wallet PIN ---default PIN is 1234
exports.changeWalletPin = async (req, res) => {
  const { oldPin, newPin, confirmNewPin } = req.body;

  try {
      const user = await User.findById(req.user._id);

      if (!user) {
          return res.status(400).json({
              message: 'User not found',
              error: true,
              success: false
          });
      }

      let wallet = await walletSettings.findOne({ userId: req.user._id });

      // If no wallet exists, create one with the default PIN
      if (!wallet) {
          wallet = new walletSettings({
              userId: req.user._id,
              pin: await bcrypt.hash('1234', 10) // Default PIN for new users (hashed)
          });

          await wallet.save();
      }

      // If the current PIN is not the default or doesn't match the old PIN
      const isOldPinCorrect = await bcrypt.compare(oldPin, wallet.pin);
      if (!isOldPinCorrect) {
          return res.status(400).json({
              message: oldPin === '1234'
                  ? 'Default PIN can only be used for the first PIN change'
                  : 'OLD PIN is incorrect',
              error: true,
              success: false
          });
      }

      // Check if the new PIN and confirm PIN match
      if (newPin !== confirmNewPin) {
          return res.status(400).json({
              message: 'New PIN and Confirm PIN DO NOT MATCH',
              error: true,
              success: false
          });
      }

      // Check if the old PIN and new PIN are the same
      if (oldPin === newPin) {
          return res.status(400).json({
              message: 'Old PIN and New PIN cannot be the same',
              error: true,
              success: false
          });
      }

      // Hash the new PIN and update it
      wallet.pin = await bcrypt.hash(newPin, 10);
      await wallet.save();

      res.status(200).json({
          message: 'PIN updated successfully',
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


exports.updateWalletBalance = async (req, res) => {
  const { amount } = req.body;

  try {
    const user = await User.findById(req.user._id);

    if (!user) {
      return res.status(404).json({
        message: 'User not found',
        error: true,
        success: false
      });
    }

    user.accountBalance += amount; // Add or deduct balance as needed
    await user.save();

    res.status(200).json({
      message: 'Wallet balance updated successfully',
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
}


