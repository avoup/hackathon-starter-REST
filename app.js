const express = require('express');
const cors = require('cors');
const mongoose = require('mongoose');
const compression = require('compression');
const dotenv = require('dotenv');
const helmet = require('helmet');
const passport = require('passport');

dotenv.config({ path: '.env.example' });

const passportConfig = require('./config/passport');

const chalk = require('chalk')

/**
 * Connect to MongoDB.
 */
mongoose.set('useFindAndModify', false);
mongoose.set('useCreateIndex', true);
mongoose.set('useNewUrlParser', true);
mongoose.set('useUnifiedTopology', true);
mongoose.connect(process.env.MONGODB_URI);
mongoose.connection.on('error', (err) => {
    console.error(err);
    console.log(chalk.red('%s error connecting to MongoDB.'));
    process.exit();
});

/**
 * Configure Express.
 */
const app = express();

app.set('host', process.env.OPENSHIFT_NODEJS_IP || '0.0.0.0');
app.set('port', process.env.PORT || process.env.OPENSHIFT_NODEJS_PORT || 8080);
app.set(compression());

app.use(cors({
    allowedHeaders: 'Content-Type,Authorization',
}));
app.use(express.json({ type: process.env.CONTENT_TYPE_HEADER }));
app.use(passport.initialize());
app.use(helmet.frameguard())
app.use(helmet.hidePoweredBy())
// app.use(helmet.hsts()) // Keep users on HTTPS
app.use(helmet.noSniff())
app.use(helmet.permittedCrossDomainPolicies())

/**
 * Check headers
 */
app.use((req, res, next) => {
    res.setHeader('Content-Type', process.env.CONTENT_TYPE_HEADER)

    if (req.get('Content-Type') !== process.env.CONTENT_TYPE_HEADER && req.get('Content-Type') !== 'multipart/form-data') {
        const error = new Error('Unsupported Media Type');
        error.statusCode = 415;
        error.title = 'Unsupported Media Type';
        error.detail = `Content-Type header should be: ${process.env.CONTENT_TYPE_HEADER}, header provided: ${req.get('Content-Type')}`;
        return next(error);
    }

    const accept = req.get('Accept');
    if (accept && accept !== process.env.CONTENT_TYPE_HEADER && req.get('Content-Type') !== 'multipart/form-data') {
        const error = new Error('Unsupported Media Type');
        error.statusCode = 406;
        error.title = 'Not Acceptable';
        error.detail = `Accept header should be: ${process.env.CONTENT_TYPE_HEADER}, header provided: ${req.get('Accept')}`;
        return next(error);
    }

    next()
})


/**
 * Access to example files
 * Remove in production
 */
app.use(express.static('examples'))

// Import routes
const authRoutes = require('./routes/auth')
const oauthRoutes = require('./routes/oauth')
const apiRoutes = require('./routes/api')

// Routes
// Remove in production
app.get('/', (req, res, next) => {
    res.status(200).json({ message: 'Hello, you reached hackathon starter api' })
})

// Remove in production
app.get('/secure', passportConfig.isAuthenticated, (req, res, next) => {
    res.status(200).json({ message: 'Hello, you reached hackathon starter secure route' })
})

/**
 * Check if post request body contains necessary objects
 */
app.post('*', (req, res, next) => {
    if (!req.body.data || !req.body.data.attributes) {
        const error = new Error();
        error.code = 401;
        error.errors = [{
            status: 401,
            title: 'Error',
            detail: `Request should contain 'data' and 'data.attributes' objects`
        }]
        return next(error)
    }
    next()
})

app.use('/auth', authRoutes);
app.use('/oauth', oauthRoutes);
app.use('/api', apiRoutes);

// 404 handler
app.use('*', (req, res, next) => {
    const error = new Error();
    error.code = 404;
    error.errors = [{
        status: 404,
        title: 'Error',
        detail: 'Requested URL cannot be found'
    }]
    return next(error)
})


/**
 * Error Handler
 */
app.use((error, req, res, next) => {
    console.log(chalk.redBright('----GLOBAL ERROR HANDLER----'))
    console.log(error);
    console.log(chalk.redBright('----ERROR END-----'))
    res.status(error.code || 500).json({
        meta: { path: req.originalUrl },
        errors: error.errors || [error]
    })
})


/**
 * Start Express server.
 */
app.listen(app.get('port'), () => {
    console.log('%s App is running at http://localhost:%d in %s mode ', chalk.green('✓'), app.get('port'), chalk.blue(app.get('env')));
    console.log(chalk.yellow('  Press CTRL-C to stop\n'));
});

module.exports = app;