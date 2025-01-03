const User = require('../models/userModel');

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
                pin: '1234' // Default PIN for new users
            });

            await wallet.save();
        }

        // If the current PIN is not the default or doesn't match the old PIN
        if (wallet.pin !== oldPin) {
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

        // Update the PIN to the new value
        wallet.pin = newPin;
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

