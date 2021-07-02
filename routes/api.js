const path = require('path');
const router = require('express').Router();
const passport = require('passport');
const passportConfig = require('../config/passport');
const apiController = require('../controllers/api');
const multer = require('multer');
const upload = multer({ dest: path.join(path.dirname(require.main.filename), 'uploads') });

router.post('/upload', upload.single('file'), apiController.postFileUpload);

module.exports = router;
