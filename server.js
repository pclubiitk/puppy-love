var winston    = require('winston');

var dbControl = require('./db.js'),
    config    = require('./config.js'),
    Routes    = require('./router.js'),
    app       = require('./app.js'),
    passAuth  = require('./passAuth.js');

// Main file for the code

if (!config.emailuser || !config.emailpass) {
    console.error("No mailer ENV variables. Mailing will not work");
};

// Listen only when you could connect to DB
dbControl.connectAndRun(function(mongoose) {

    // Plug in passport
    passAuth.handleAuth(app, mongoose.connection);

    // Since mongoose callback has to be a function
    // without any arguments
    passport = passAuth.loginMethod(mongoose);

    return function() {
        app.use(config.api, new Routes(mongoose, passport));

        // Clean exit :)
        process.on('SIGINT', function() {
            console.log("Closing DB");
            mongoose.connection.close();
            console.log("Exiting");
            process.exit();
        });

        // Start listening
        // Follows the routes
        app.listen(config.web.port, config.web.host, function () {
            winston.log('info', 'Puppy backend listening at http://%s:%s',
                        config.web.host, config.web.port);
        });
    };
});
