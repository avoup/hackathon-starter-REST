const router = require('express').Router();
const passport = require('passport');
const passportConfig = require('../config/passport');

const oauthController = require('../controllers/oauth');

// Social login handlers
router.get('/success', oauthController.success);
router.get('/fail', oauthController.fail);

// Google
router.get('/google', passport.authenticate('google', {scope: ['email', 'profile']}));
router.get('/google/callback', oauthController.googleAuth);

module.exports = router;