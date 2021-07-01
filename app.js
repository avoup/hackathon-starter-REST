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
    console.log('%s error connecting to MongoDB.');
    process.exit();
});

/**
 * Configure Express.
 */
const app = express();

app.set('json:api', false); // JSON:API header check, false: will not check
app.set('host', process.env.OPENSHIFT_NODEJS_IP || '0.0.0.0');
app.set('port', process.env.PORT || process.env.OPENSHIFT_NODEJS_PORT || 8080);
app.set(compression());

app.use(cors({
    allowedHeaders: 'Content-Type,Authorization',
}));
app.use(express.json({ type: 'application/vnd.api+json' }));
app.use(passport.initialize());
app.use(helmet.frameguard())
app.use(helmet.hidePoweredBy())
// app.use(helmet.hsts()) // Keep users on HTTPS
app.use(helmet.noSniff())
app.use(helmet.permittedCrossDomainPolicies())

/**
 * JSON:API headers
 * check headers according to JSON:API specification
 */
if (app.get('json:api')) {
    app.use((req, res, next) => {
        res.setHeader('Content-Type', 'application/vnd.api+json')

        if (req.get('Content-Type') !== 'application/vnd.api+json') {
            const err = new Error('Unsupported Media Type')
            err.statusCode = 415;
            err.title = 'Unsupported Media Type',
                err.detail = `Content-Type header should be: 'application/vnd.api+json'`
            throw err;
        }

        const accept = req.get('Accept');
        if (accept && accept !== 'application/vnd.api+json') {
            const err = new Error('Unsupported Media Type')
            err.statusCode = 406;
            err.title = 'Not Acceptable',
                err.detail = `Accept header should be: 'application/vnd.api+json'`
            throw err;
        }
        
        next()
    })
}


app.use(express.static('examples')) // Remove in production

// Import routes
const authRoutes = require('./routes/auth')
const oauthRoutes = require('./routes/oauth')

// Remove in production
app.get('/', (req, res, next) => {
    res.status(200).json({
        data: {
            type: 'Hello',
            attributes: {
                detail: 'you reached hackathon starter api'
            }
        }
    })
})

// Remove in production
app.get('/secure', passportConfig.isAuthenticated, (req, res, next) => {
    res.status(200).json({
        data: {
            type: 'secure',
            attributes: {
                detail: 'you reached hackathon starter secure route'
            }
        }
    })
})

// Use routes
app.use('/auth', authRoutes);
app.use('/oauth', oauthRoutes);


/**
 * Error Handler
 */
app.use((error, req, res, next) => {
    console.log(chalk.redBright('----GLOBAL ERROR HANDLER----'))
    // console.log(error);
    res.status(error.code || 500).json({
        meta: { path: req.originalUrl },
        errors: error.errors || [error]
    })
    console.log(chalk.redBright('----ERROR END-----'))
})


/**
 * Start Express server.
 */
app.listen(app.get('port'), () => {
    console.log('%s App is running at http://localhost:%d in %s mode ', chalk.green('✓'), app.get('port'), chalk.blue(app.get('env')));
    console.log(chalk.yellow('  Press CTRL-C to stop\n'));
});

module.exports = app;