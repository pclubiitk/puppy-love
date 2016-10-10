var winston    = require('winston');

var dbControl = require('./db.js'),
    config    = require('./config.js'),
    Routes    = require('./router.js'),
    app       = require('./app.js');

// Main file for the code

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

        // Start listening
        // Follows the routes
        app.listen(config.web.port, config.web.host, function () {
            winston.log('info', 'Puppy backend listening at http://%s:%s',
                        config.web.host, config.web.port);
        });
    };
});
