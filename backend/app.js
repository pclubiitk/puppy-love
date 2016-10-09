var express    = require('express'),
    path       = require('path'),
    logger     = require('morgan'),
    bodyParser = require('body-parser'),
    winston    = require('winston');

var __dirname = path.resolve(path.dirname()),
    app = express();

var dbControl = require('./db.js'),
    config    = require('./config.js'),
    Routes    = require('./router.js');

app.use(logger('short'));
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));
app.use(express.static(path.join(__dirname, 'public')));

// Listen only when you could connect to DB
dbControl.connectAndRun(function(mongoose) {
    // Since mongoose callback has to be a function
    // without any arguments
    return function() {
        app.use('/api', new Routes(mongoose));

        // Clean exit :)
        process.on('SIGINT', function() {
            console.log("Closing DB");
            mongoose.connection.close();
            console.log("Exiting");
            process.exit();
        });

        app.listen(config.web.port, config.web.host, function () {
            winston.log('info', 'Puppy backend listening at http://%s:%s',
                        config.web.host, config.web.port);
        });
    };
});

module.exports = app;
