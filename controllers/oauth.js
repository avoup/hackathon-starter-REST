const passport = require('passport');
const jwt = require('jsonwebtoken')

/**
 * GET /success
 * Handle social login success
 */
exports.success = (req, res, next) => {
    // In case of success, JWT token is passed as a header
    let token = req.get('Authorization');
    token = token ? token : req.query.token; // if header is not set get token from query

    jwt.verify(token, process.env.JWT_SECRET, (err, decoded) => {
        if (err) {
            const error = new Error();
            error.code = 401;
            error.errors = [{
                status: 401,
                title: 'jwttokenerror',
                detail: 'Invalid jwt token'
            }]
            return next(error)
        }

        return res.status(200).json({
            data: {
                type: 'jwt bearer token',
                id: token,
                attributes: {
                    expiresIn: process.env.JWT_EXPIRE
                }
            }
        })
    })

}

/**
 * GET /failure
 * Handle social login failure
 */
exports.fail = (req, res, next) => {
    const error = new Error();
    error.code = 401;
    error.errors = [{
        status: 401,
        title: 'oauthfail',
        details: 'Login using oauth failed. Try again later!'
    }];
    return next(error);
}

/**
 * Google auth callback
 * for popup window
 *   see 'examples/oauth-popup'
 */
exports.googleAuth = (req, res, next) => {
    passport.authenticate('google', { session: false }, (err, user, info) => {
        // Response html for popup
        const response = (msg) => {
            return `<html><script>
                    const message = ${JSON.stringify(msg)};
                    window.opener.postMessage(message, '${process.env.BASE_URL}');
                    window.close();
                </script></html>`
        }

        if (err) return res.send(response(err));
        if (!user) return res.send(response({ code: '401', errors: [{ status: '401', title: 'unknownerror', details: 'Unknown error occured. Try again later!'}]}));

        const token = jwt.sign(
            {
                _id: user._id,
                email: user.email
            },
            process.env.JWT_SECRET,
            { expiresIn: process.env.JWT_EXPIRE }
        );

        res.send(response({
            data: {
                type: 'jwt bearer token',
                id: token,
                attributes: {
                    expiresIn: process.env.JWT_EXPIRE
                }
            }
        }));

    })(req, res, next)
}