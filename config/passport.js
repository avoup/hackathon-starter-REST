const passport = require('passport');
const LocalStrategy = require('passport-local').Strategy;
const { Strategy: JWTStrategy, ExtractJwt: ExtractJwt } = require('passport-jwt');
const GoogleStrategy = require('passport-google-oauth2').Strategy;

const User = require('../models/User');

const chalk = require('chalk')
/**
 * Sign in using Email and Password.
 */
passport.use(new LocalStrategy({ usernameField: 'email' }, (email, password, done) => {
    User.findOne({ email: email.toLowerCase() }, (err, user) => {
        if (err) { return done(err); }
        if (!user) {
            console.log(chalk.red('failed login'))
            return done(null, false, {
                status: '404',
                title: 'notfound',
                detail: `User with email: ${email} not found.`
            });
        }        
        if (!user.isVerified) { // Make sure non verified user can't log in
            console.log(chalk.red('failed login'))
            return done(null, false, {
                status: '401',
                title: 'authenticationerror',
                detail: `User is not verified.`
            });
        }
        if (!user.password) {
            console.log(chalk.red('failed login'))
            return done(null, false, {
                status: '422',
                title: 'validationerror',
                detail: 'Account was registered using a sign-in provider.'
            });
        }
        user.comparePassword(password, (err, isMatch) => {
            if (err) { return done(err); }
            if (isMatch) {
                return done(null, user);
            }
            console.log(chalk.red('failed login'))
            return done(null, false, {
                status: '422',
                title: 'validationerror',
                detail: 'Invalid password.'
            });
        });
    });
}));

/**
 * JWT Strategy
 * Check if authorized by checking token validity: {Authorization: bearer <token>}
 */
passport.use(new JWTStrategy(
    {
        secretOrKey: process.env.JWT_SECRET,
        jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
    },
    (token, done) => {
        done(null, { _id: token._id, email: token.email })
    }
))

/**
 * Check authentication
 */
exports.isAuthenticated = (req, res, next) => {
    passport.authenticate('jwt', { session: false }, (err, user, info) => {
        if (err) return next(err)
        if (!user) {
            const error = new Error();
            error.code = 401;
            error.errors = [{
                source: { pointer: req.originalUrl},
                status: '401',
                title: info.name,
                detail: info.message
            }]
            return next(error);
        }
        return next()
    })(req, res, next)
}


/**
 * Google oAuth 2
 */

passport.use(new GoogleStrategy({
    clientID: process.env.GOOGLE_ID,
    clientSecret: process.env.GOOGLE_SECRET,
    callbackURL: process.env.BASE_URL + "/oauth/google/callback",
    passReqToCallback: true
},
    function (req, accessToken, refreshToken, params, profile, done) {
        
            User.findOne({ google: profile.id }, (err, existingUser) => {
                if (err) { return done(err); }
                if (existingUser) {                    
                    return done(null, existingUser);
                }
                User.findOne({ email: profile.emails[0].value }, (err, existingEmailUser) => {
                    if (err) { return done(err); }
                    if (existingEmailUser) {
                        const error = new Error();
                        error.code = 422;
                        error.errors = [{
                            status: 422,
                            title: 'userexists',
                            detail: 'User with the email address already exists.'
                        }]                        
                        return done(error);
                    } else {
                        const user = new User();
                        user.email = profile.emails[0].value;
                        user.google = profile.id;
                        user.isVerified = true;
                        const tokenExpires = new Date()
                        tokenExpires.setSeconds(tokenExpires.getSeconds() + params.expires_in)
                        user.tokens.push({
                            kind: 'google',
                            accessToken,
                            accessTokenExpires: tokenExpires,
                            refreshToken,
                        });
                        user.profile.name = profile.displayName;
                        user.profile.gender = profile._json.gender;
                        user.profile.picture = profile._json.picture;
                        user.save((err) => {
                            done(err, user);
                        });
                    }
                });
            });
        
    }
));
