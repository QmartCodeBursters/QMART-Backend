// const jwt = require('jsonwebtoken');
// const User = require('../models/userModel');

// const authenticateUser = async (req, res, next) => {
 
//     const token = req.header('Authorization');
//     console.log('Received Token:', token); // Log the token for debugging

//     if (!token) {
//       return res.status(401).json({
//         message: 'Authentication token missing',
//         error: true,
//         success: false
//       });
//     }
//     try {
//       const decoded = jwt.verify(token.replace('Bearer ', ''), process.env.JWT_SECRET);
//       console.log('Decoded Token:', decoded); // Log decoded token for debugging

//     const user = await User.findById(decoded._id);
//     if (!user) {
//       return res.status(404).json({
//         message: 'User not found',
//         error: true,
//         success: false
//       });
//     }
  
//     req.user = user; 
//     next(); 
//   } catch (error) {
//     console.error('JWT Verification Error:', error.message);
//     return res.status(401).json({ 
//       message: 'Authentication failed',
//       error: error.message,
//       success: false 
//     });

//   }
//   };


// module.exports = authenticateUser;



// const jwt = require('jsonwebtoken');
// const User = require('../models/userModel');

// const authenticateUser = async (req, res, next) => {
//   // Get token from Authorization header
//   const token = req.header('Authorization');
// console.log('Received Token:', token); // Log the token for debugging

// if (!token) {
//   return res.status(401).json({
//     message: 'Authentication token missing',
//     error: true,
//     success: false,
//   });
// }

// // Ensure correct token format: 'Bearer <JWT>'
// if (!token.startsWith('Bearer ')) {
//   return res.status(400).json({
//     message: 'Token is not in the correct format',
//     error: true,
//     success: false,
//   });
// }

// try {
//   // Remove 'Bearer ' prefix and verify the token
//   const decoded = jwt.verify(token.replace('Bearer ', ''), process.env.JWT_SECRET);
//   console.log('Decoded Token:', decoded); // Log decoded token for debugging

//   // Continue with the request handling...
// } catch (error) {
//   console.error('JWT Verification Error:', error.message);
//   return res.status(401).json({
//     message: 'Authentication failed',
//     error: error.message,
//     success: false,
//   });
// }

// };

// module.exports = authenticateUser;


const jwt = require('jsonwebtoken');

const authenticateUser = async (req, res, next) => {
  const token = req.cookies.jwt;  // Make sure this is the correct cookie name
  console.log('Received Token from cookies:', token);

  if (!token) {
    return res.status(401).json({
      message: 'Authentication token missing',
      error: true,
      success: false, 
    });
  }

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    console.log('Decoded Token:', decoded);
    req.user = decoded;  // Store decoded token data in req.user
    next();  // Proceed with request processing
  } catch (error) {
    console.error('JWT Verification Error:', error.message);
    return res.status(401).json({
      message: 'Authentication failed',
      error: error.message,
      success: false,
    });
  }
};


module.exports = authenticateUser;
