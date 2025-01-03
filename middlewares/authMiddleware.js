const jwt = require('jsonwebtoken');
const User = require('../models/userModel');

const authenticateUser = async (req, res, next) => {
  try {
    const token = req.header('Authorization');

    // Check if token is present in the Authorization header
    if (!token) {
      return res.status(401).json({ 
        message: 'Authentication token missing',
        error: true,
        success: false 
      });
    }

    // Remove the "Bearer " prefix and verify the token
    const decoded = jwt.verify(token.replace('Bearer ', ''), process.env.JWT_SECRET);
    
    const user = await User.findById(decoded._id);
    if (!user) {
      return res.status(404).json({ 
        message: 'User not found',
        error: true,
        success: false  
      });
    }

    req.user = user;  // Attach the user to the request object
    next();  // Proceed to the next middleware or controller
  } catch (error) {
    res.status(401).json({ 
      message: 'Authentication failed', 
      error: error.message,
      success: false 
    });
  }
};

module.exports = authenticateUser;

