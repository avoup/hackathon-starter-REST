const router = require('express').Router();
const passport = require('passport');
const passportConfig = require('../config/passport');
const authController = require('../controllers/auth');


router.post('/login', authController.postLogin);
router.post('/signup', authController.postSignup);

router.post('/resend', authController.resendVerify);
router.get('/verify', authController.verifyEmail);

router.post('/forgot', authController.forgotPassword);
router.post('/reset', authController.resetPassword);

module.exports = router;
