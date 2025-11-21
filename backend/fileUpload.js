// fileUploadUtil.js
const path = require('path');
const multer = require('multer');
const { v4: uuidv4 } = require('uuid');
const fs = require('fs');

// Set storage engine
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    const uploadPath = path.join(__dirname, 'uploads');
    // Create directory if it doesn't exist
    if (!fs.existsSync(uploadPath)) {
      fs.mkdirSync(uploadPath, { recursive: true });
    }
    cb(null, uploadPath);
  },
  filename: function (req, file, cb) {
    // Generate unique filename
    const ext = path.extname(file.originalname);
    cb(null, uuidv4() + ext);
  },
});

// Multer middleware for multiple files
const uploadFiles = multer({ storage }).array('files', 10); // max 10 files

module.exports = {
  uploadFiles,
};
