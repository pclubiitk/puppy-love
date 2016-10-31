var session = require('express-session'),
    flash   = require('connect-flash'),
    MongoStore = require('connect-mongo')(session),
    passport = require('passport'),
    LocalStrategy = require('passport-local').Strategy;

var User = require('./models/user.js');

exports.handleAuth = function(app, db) {
    app.use(session({
        secret: require('./config.js').sessionSecret,
        ttl: 1 * 60 * 60,   // One hour
        resave: false,      // Less db calls
        saveUninitialized: false, // Even lesser db calls
        store: new MongoStore({
            mongooseConnection: db
        }, function(err) {
            if (err) {
                console.error('Could not setup session storage with Mongo');
            };
        })
    }));

    // Flashing error messages esp for login
    app.use(flash());

    app.use(passport.initialize());
    app.use(passport.session());
};

exports.loginMethod = function(mongoose) {
    passport.use(new LocalStrategy(
        function(_rollno, password, done) {
            var rollno = parseInt(_rollno, 10);

            // String representation should match as well
            if (rollno === NaN || rollno != _rollno) {
                return(done, null, false, { messsage: 'Incorrect username.'});
            } else {
                User(mongoose).findOne({ _id: rollno }, function(err, user) {
                    if (err) {
                        return done(err);
                    }
                    if (!user) {
                        return done(null, false, { message: 'Incorrect username.' });
                    }
                    if (!user.validPassword(password)) {
                        return done(null, false, { message: 'Incorrect password.' });
                    }
                    return done(null, user);
                });
            };
        }
    ));


    passport.serializeUser(function(user, done) {
        done(null, {name: user.name, roll: user._id});
    });

    passport.deserializeUser(function(user, done) {
        done(null, user);
    });

    return passport;
}
