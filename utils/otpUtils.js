  const generateOtp = () => {
    return Math.floor(100000 + Math.random() * 900000).toString();
  };
  
  
function verifyOtp(req, res, next) {
    try {
      const { otp, userOtp, otpExpiresAt } = req.body;
  
      
      if (otp === userOtp && new Date() < new Date(otpExpiresAt)) {
        next();
      } else {
        res.status(400).json({ message: 'Invalid or expired OTP' });
      }
    } catch (error) {
      console.error('Error verifying OTP:', error);
      res.status(500).json({ message: 'An error occurred while verifying OTP.' });
    }
  }
  
  module.exports = { generateOtp, verifyOtp };
  