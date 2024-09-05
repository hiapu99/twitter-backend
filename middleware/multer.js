const multer = require('multer');
const { v4: uuidv4 } = require('uuid');
const path = require('path');

const storage = multer.diskStorage({
    destination: function (req, file, cb) {
        cb(null, 'public/Images');
    },
    filename: function (req, file, cb) {
        const newpicture = uuidv4() + path.extname(file.originalname);
        cb(null, newpicture);
    }
});

module.exports = multer({ storage: storage });
