const User = require('../models/userModel');

const generateAccountNumber = async () => {
  
    return Math.floor(100000000 + Math.random() * 900000000).toString(); // 9-digit string
  };
  


module.exports = { generateAccountNumber };
