const passport = require('passport');
const validator = require('validator');
const jwt = require('jsonwebtoken')
const sendMail = require('../helpers/sendMail');

const User = require('../models/User');

const chalk = require('chalk')

/**
 *  Send verification email
 * 
 */
const sendVerify = (userId, redirectURL, toEmail) => {
    const token = jwt.sign(
        {
            _id: userId,
        },
        process.env.JWT_EMAIL_SECRET,
        { expiresIn: process.env.JWT_EMAIL_EXPIRE }
    );

    // Send verification email
    const msg = {
        to: toEmail,
        from: 'no-reply@signlegaly.com',
        subject: 'HSR Email verification',
        html: `<html>
                <strong>Follow this link to verify your email:</strong> 
                <a href='${redirectURL}?token=${token}'>verify</a>
            </html>`,
    }
    return sendMail(msg)
}

/**
 * POST /login
 * JWT sign in using email and password.
 */
exports.postLogin = (req, res, next) => {
    req.body.email = req.body.data.attributes.email;
    req.body.password = req.body.data.attributes.password;

    const validationErrors = [];
    if (!req.body.email || req.body.email && !validator.isEmail(req.body.email)) {
        validationErrors.push({
            source: { pointer: 'data/attributes/email' },
            status: '422',
            title: 'validationerror',
            detail: 'Email address is not valid.',
        });
    }
    if (!req.body.password || req.body.password && validator.isEmpty(req.body.password)) {
        validationErrors.push({
            source: { pointer: 'data/attributes/password' },
            status: '422',
            title: 'validationerror',
            detail: 'Password cannot be blank.'
        });
    }

    if (validationErrors.length) {
        const error = new Error()
        error.code = 422
        error.errors = validationErrors
        return next(error)
    }
    req.body.email = validator.normalizeEmail(req.body.email, { gmail_remove_dots: false });

    passport.authenticate('local', { session: false }, (err, user, info) => {
        if (err) { return next(err); }
        if (!user) {
            const error = new Error();
            error.code = 401;
            error.errors = [info];
            return next(error)
        }

        req.logIn(user, { session: false }, (err) => {
            if (err) { return next(err); }
            const token = jwt.sign(
                {
                    _id: user._id,
                    email: user.email
                },
                process.env.JWT_SECRET,
                { expiresIn: process.env.JWT_EXPIRE }
            );
            console.log(chalk.green('successful login'))
            return res.status(200).json({
                data: {
                    type: 'jwt bearer token',
                    id: token,
                    attributes: {
                        expiresIn: process.env.JWT_EXPIRE
                    }
                }
            })
        });
    })(req, res, next);
};

/**
 * POST /signup
 * Create a new local account.
 */
exports.postSignup = (req, res, next) => {
    req.body.email = req.body.data.attributes.email;
    req.body.password = req.body.data.attributes.password;
    req.body.confirmPassword = req.body.data.attributes.confirmPassword;
    req.body.redirect = req.body.data.attributes.redirect;

    const validationErrors = [];
    if (!req.body.email || !validator.isEmail(req.body.email)) validationErrors.push({
        source: { pointer: '/data/attributes/email' },
        status: 422,
        title: 'validationerror',
        detail: 'Email address is invalid.'
    });
    if (!req.body.password || !validator.isLength(req.body.password, { min: 4 })) validationErrors.push({
        source: { pointer: '/data/attributes/password' },
        status: 422,
        title: 'validationerror',
        detail: 'Password must be at least 4 characters long',
    });
    if (!req.body.confirmPassword || req.body.password !== req.body.confirmPassword) validationErrors.push({
        source: { pointer: '/data/attributes/confirmPassword' },
        status: 422,
        title: 'validationerror',
        detail: 'Passwords do not match'
    });
    // Email verification page url    
    if (req.body.redirect && !validator.isURL(req.body.redirect)) validationErrors.push({
        source: { pointer: '/data/attributes/redirect' },
        status: 422,
        title: 'validationerror',
        detail: 'Redirect is not a valid URL'
    });

    if (validationErrors.length) {
        const error = new Error()
        error.code = 422;
        error.errors = validationErrors;
        return next(error)
    }
    req.body.email = validator.normalizeEmail(req.body.email, { gmail_remove_dots: false });

    User.findOne({ email: req.body.email }, (err, existingUser) => {
        if (err) { return next(err); }
        if (existingUser) {
            const error = new Error()
            error.code = 422;
            error.errors = [{
                status: '422',
                title: 'validationerror',
                detail: 'Account with that email address already exists.'
            }]
            return next(error)
        }
        const user = new User({
            email: req.body.email,
            password: req.body.password,
            isVerified: false,
        });
        user.save((err, newUser) => {
            if (err) { return next(err); }

            /**
             * Email verification steps:
             * 
             * 1. Check if 'redirect' field is provided
             * 2. If not set default url
             * 3. Send url to email with query parameter 'token'
             * 4. Email verification page should get query parameter 'token'
             *      and make request with provided query to the verifyEmail route
             *      '/auth/verify?token=<jwt.token>'
             *      and handle response.
             * 
             * *DO NOT use verifyEmail url as email verification page,
             *     as it is not a webpage it will return a json response.
             */
            sendVerify(newUser._id, req.body.redirect ? req.body.redirect : process.env.BASE_URL + `/auth/verify`, req.body.email)
                .then(() => res.status(204).json())
                .catch(err => next(err));
        });
    });
};

/**
 * GET /verify
 * Verify email via JWT
 */
exports.verifyEmail = (req, res, next) => {
    jwt.verify(req.query.token, process.env.JWT_EMAIL_SECRET, (err, token) => {
        if (err) {
            const error = new Error();
            error.code = 401;
            error.errors = [{
                status: 401,
                title: 'jwttokeninvalid',
                detail: 'Provided jwt token is invalid'
            }]
            return next(error);
        }

        User.findById(token._id, (err, user) => {
            if (err) return next(err);
            if (!user) {
                const error = new Error();
                error.code = 404;
                error.errors = [{
                    status: 404,
                    title: 'notfound',
                    detail: 'User with given id not found'
                }]
                return next(error);
            }
            if (user.isVerified) {
                const error = new Error();
                error.code = 422;
                error.errors = [{
                    status: 422,
                    title: 'verificationerror',
                    detail: 'User is already verified'
                }]
                return next(error);
            }
            user.isVerified = true;
            user.save();

            res.status(200).json({
                data: {
                    type: 'notification',
                    attributes: {
                        detail: 'User verified successfully'
                    }
                }
            })
        })
    });
}

/**
 * POST /resend
 * Resend verification email.
 */
exports.resendVerify = (req, res, next) => {
    req.body.email = req.body.data.attributes.email;
    req.body.redirect = req.body.data.attributes.redirect;

    const validationErrors = [];
    if (!req.body.email || !validator.isEmail(req.body.email)) validationErrors.push({
        source: { pointer: '/data/attributes/email' },
        status: 422,
        title: 'validationerror',
        detail: 'Email address is invalid.'
    });
    // Email verification page url    
    if (req.body.redirect && !validator.isURL(req.body.redirect)) validationErrors.push({
        source: { pointer: '/data/attributes/redirect' },
        status: 422,
        title: 'validationerror',
        detail: 'Redirect is not a valid URL'
    });

    if (validationErrors.length) {
        const error = new Error()
        error.code = 422;
        error.errors = validationErrors;
        return next(error)
    }
    req.body.email = validator.normalizeEmail(req.body.email, { gmail_remove_dots: false });

    User.findOne({ email: req.body.email }, (err, existingUser) => {
        if (err) { return next(err); }
        if (!existingUser) {
            const error = new Error()
            error.code = 404;
            error.errors = [{
                status: '404',
                title: 'notfound',
                detail: 'Account with that email address does not exist.'
            }]
            return next(error)
        }
        if (existingUser.isVerified) {
            const error = new Error()
            error.code = 422;
            error.errors = [{
                status: '422',
                title: 'Error',
                detail: 'Email is already verified.'
            }]
            return next(error)
        }

        sendVerify(
            existingUser._id,
            req.body.redirect ? req.body.redirect : process.env.BASE_URL + `/auth/verify`,
            req.body.email
        )
            .then(() => res.status(204).json())
            .catch(err => next(err));

    });
};

/**
 * GET /forgot
 * Request password reset.
 */
exports.forgotPassword = (req, res, next) => {
    req.body.email = req.body.data.attributes.email;
    req.body.redirect = req.body.data.attributes.redirect;

    const validationErrors = [];
    if (!req.body.email || !validator.isEmail(req.body.email)) {
        validationErrors.push({
            source: { pointer: '/data/attributes/email' },
            status: 422,
            title: 'validationerror',
            detail: 'Email address is invalid.'
        });
    }

    /**
     * Check if custom email verification url is provided
     * 
     *  If provided, url will be sent to user's email:
     *      <custom-url>?token=<json-web-token>
     *      and it should make a request to '/reset' to reset password.
     *      e.g:
     *      {
     *          "data":{ 
     *              "attributes":{
     *                  "token": <json-web-token>,
     *                  "password": <password>,
     *                  "confirmPassword": <confirmPassword>,
     *              }
     *          }
     *      }
     *  if not provided, redirect will be an example html file at '/password-reset'
     *  
     * */
    if (req.body.redirect && !validator.isURL(req.body.redirect, { protocols: ['http', 'https'], require_protocol: true, require_tld: false })) {
        validationErrors.push({
            source: { pointer: '/data/attributes/redirect' },
            status: 422,
            title: 'validationerror',
            detail: 'Redirect is not a valid URL'
        });
    }

    if (validationErrors.length) {
        const error = new Error()
        error.code = 422;
        error.errors = validationErrors;
        return next(error)
    }

    User.findOne({ email: req.body.email }, (err, existingUser) => {
        if (err) { return next(err); }
        if (!existingUser) {
            const error = new Error()
            error.code = 422;
            error.errors = [{
                status: '404',
                title: 'notfound',
                detail: 'Account with that email address was not found'
            }]
            return next(error)
        }
        // Set redirect url
        req.body.redirect = req.body.redirect ? req.body.redirect : process.env.BASE_URL + `/password-reset`;

        const token = jwt.sign(
            {
                _id: existingUser._id,
            },
            process.env.JWT_PASSWORD_RESET_SECRET,
            { expiresIn: process.env.JWT_PASSWORD_RESET_EXPIRE }
        );
        const msg = {
            to: req.body.email,
            from: 'no-reply@signlegaly.com',
            subject: 'HSR password reset',
            html: `<html>
                    <strong>Follow this link to reset your password:</strong> 
                    <a href='${req.body.redirect}?token=${token}'>RESET</a>
                </html>`,
        }
        sendMail(msg)
            .then(() => res.status(204).json())
            .catch(err => next(err));
    });
}
/**
 * GET /reset
 * Reset password
 */
exports.resetPassword = (req, res, next) => {
    req.body.password = req.body.data.attributes.password;
    req.body.confirmPassword = req.body.data.attributes.confirmPassword;
    req.body.redirect = req.body.data.attributes.redirect;
    req.body.token = req.body.data.attributes.token;

    const validationErrors = [];
    if (!req.body.password || !validator.isLength(req.body.password, { min: 4 })) {
        validationErrors.push({
            source: { pointer: '/data/attributes/password' },
            status: 422,
            title: 'validationerror',
            detail: 'Password must be at least 4 characters long',
        });
    }
    if (!req.body.confirmPassword || req.body.password !== req.body.confirmPassword) {
        validationErrors.push({
            source: { pointer: '/data/attributes/confirmPassword' },
            status: 422,
            title: 'validationerror',
            detail: 'Passwords do not match'
        });
    }
    // Email verification page url    
    if (req.body.redirect && !validator.isURL(req.body.redirect)) {
        validationErrors.push({
            source: { pointer: '/data/attributes/redirect' },
            status: 422,
            title: 'validationerror',
            detail: 'Redirect is not a valid URL'
        });
    }

    if (validationErrors.length) {
        const error = new Error()
        error.code = 422;
        error.errors = validationErrors;
        return next(error)
    }

    jwt.verify(req.body.token, process.env.JWT_PASSWORD_RESET_SECRET, (err, token) => {
        if (err) {
            const error = new Error();
            error.code = 401;
            error.errors = [{
                status: 401,
                title: 'jwttokeninvalid',
                detail: 'Provided jwt token is invalid'
            }]
            return next(error);
        }

        User.findById(token._id, (err, user) => {
            if (err) return next(err);
            if (!user) {
                const error = new Error();
                error.code = 404;
                error.errors = [{
                    status: 404,
                    title: 'notfound',
                    detail: 'User not found'
                }]
                return next(error);
            }
            if (!user.isVerified) { // Forbid reset if user is not verified
                const error = new Error();
                error.code = 401;
                error.errors = [{
                    status: 401,
                    title: 'verificationerror',
                    detail: 'User is not verified! Verify first and then try resetting password!'
                }]
                return next(error);
            }
            user.password = req.body.password;
            user.save();

            res.status(204).json()
        })
    });
}
