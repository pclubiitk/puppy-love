var express    = require('express'),
    requireDir = require('require-dir'),
    assert     = require('assert');

var config      = require('./config.js'),
    controllers = requireDir('./controllers');

module.exports = function(db, passport) {
    var router = express.Router();

    // Helper for each call
    var checkAuth = function (req, res, next) {
        if (req.isAuthenticated()) {
            return next();
        } else {
            req.flash('error', 'Unauthenticated request');
            res.status(401);
            res.send();
        };
    };

    // Wrapper for adding all function calls
    var addRoute = function(method, route, handler) {
        router[method](route,
               checkAuth,
               handler);
    };

    // Custom passport authentication handler
    var isLocalAuthenticated = function(req, res, next) {
        passport.authenticate('local', function(err, user, info) {
            if (err) { return next(err); }

            // user will be set to false, if not authenticated
            if (!user) {
                res.status(401).json(info); //info contains the error message
            } else {
                // if user authenticated maintain the session
                req.logIn(user, function() {
                    res.redirect(config.api + '/');
                });
            };
        })(req, res, next);
    };

    // Log In, Log Out status
    router.post('/login', isLocalAuthenticated);
    router.get('/logout', function(req, res) {
        req.logout();
        res.redirect('/');
    });
    router.post('/update/new', controllers.user.newUser(db));
    router.post('/update/first', controllers.user.firstLogin(db));
    router.post('/update/mail', controllers.user.sendEmail(db));

    // ==============
    // All the routes
    // ==============
    addRoute('get', '/', function(req, res) {
        res.send('Hello from the other side');
    });

    addRoute('get',  '/findUser', controllers.user.findUser(db));

    // TODO: Only for testing passport.js
    // Needs to be removed in production
    // #security, #important
    router.get('/findUser2', controllers.user.findUser(db));

    addRoute('post', '/update/data',   controllers.user.updateData(db));
    addRoute('get',  '/update/submit', controllers.user.submittedTrue(db));
    addRoute('post', '/update/pass',   controllers.user.changePassword(db));
    addRoute('post', '/info/login',    controllers.user.getInfoOnLogin(db));

    addRoute('post', '/twoparty/new',     controllers.twoparty.newEntry(db));
    addRoute('post', '/twoparty/newbulk', controllers.twoparty.newBulk(db));
    addRoute('post', '/twoparty/rStep2',  controllers.twoparty.rStep2(db));
    addRoute('post', '/twoparty/sStep2',  controllers.twoparty.sStep2(db));
    addRoute('post', '/twoparty/sStep3',  controllers.twoparty.sStep3(db));
    addRoute('post', '/twoparty/rStep4',  controllers.twoparty.rStep4(db));
    addRoute('post', '/twoparty/sview',   controllers.twoparty.senderView(db));
    addRoute('post', '/twoparty/rview',   controllers.twoparty.recvView(db));
    addRoute('get', '/twoparty/sendstat',controllers.twoparty.getSenderStatus(db));
    addRoute('get', '/twoparty/recvstat',controllers.twoparty.getReceiverStatus(db));

    // Remove this before submitting #todo
    addRoute('post', '/twoparty/disp',    controllers.twoparty.displayAll(db));
    return router;
};
