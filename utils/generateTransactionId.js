const crypto = require("crypto");

const generateReferenceId = () => {
  return crypto.randomBytes(8).toString("hex").toUpperCase(); // Generates a unique 16-character alphanumeric ID
};

module.exports = generateReferenceId;
