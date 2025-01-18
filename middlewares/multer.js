const multer = require('multer');

const storage = multer.memoryStorage();  // or use diskStorage if preferred
const upload = multer({ storage: storage });

module.exports = upload;  // Export the 'upload' middleware
