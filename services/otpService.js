const crypto = require('crypto');

const generateOtp = () => crypto.randomInt(100000, 999999).toString(); // 6 digits

module.exports = { generateOtp };
