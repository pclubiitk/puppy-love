var User = require('../models/user.js'),
    utils = require('../controllers/utils.js');

// Endpoint for creating user
// TODO: Remove in production use
// Usage: http get localhost:8091/api/newUser name="saksham" \
// roll="14588" ...
exports.newUser = function(mongoose) {
    return function(req, res) {
        var neuMann = new User(mongoose)({
            _id: req.body.roll,
            name: req.body.name,
            passHash: req.body.passHash,
            pubKey: "def",
            privKey: "poi",
            authCode: "asdasdas"
        });

        neuMann.save(function(err, man) {
            if (err) {
                console.error(err);
                res.status(500);
                res.send('An error occurred');
            } else {
                res.send('Added new user: ' + man.name);
            };
        });
    };
};

// Endpoint to get user information
// TODO: Modify to only pass basic info in production
// Usage: http get localhost:8091/api/findUser name="Saksham"
exports.findUser = function(mongoose) {
    return function(req, res) {
        User(mongoose).find({name: new RegExp(req.body.name)}, {},
                            function(err, resp) {
                                if (err) {
                                    res.status(500);
                                    res.send(err);
                                } else {
                                    res.send(resp);
                                };
                            });
    };
};

// To be called on first attempt at logging in
exports.submitUserInfo = function(mongoose) {

    // Helper function which does the heavy lifting
    var updater = function(req, callback) {
        User(mongoose).findById(req.body.roll, function(err, p) {
            if (!p) {
                console.error("Bad id: " + req.body.roll);
                callback(1);
            } else {
                var couldUpdate = p.updateInfo(req.body.authCode,
                                               req.body.passHash,
                                               req.body.pubKey,
                                               req.body.privKey);
                if (couldUpdate) {
                    // Auth token was correct
                    p.save(function(err) {
                        if (err) {
                            console.error("Couldn't save");
                            callback(-1);
                        } else {
                            callback(0);
                        };
                    });
                } else {
                    // Must've been a bad auth token
                    console.error("Bad auth token");
                    callback(2);
                };
            };
        });
    };

    // The actual code called on submitUserInfo
    return function(req, res) {
        if (utils.reqBodyParse(req, ['authCode', 'passHash',
                                     'pubKey', 'privKey', 'roll'])) {
            // All fields present
            updater(req, function(result) {
                if (result == 0) {
                    utils.response(res, "Updated information");
                } else if (result == 1) {
                    utils.response(res, "Bad roll number", 400);
                } else if (result == 2) {
                    utils.response(res, "Bad auth code", 400);
                } else {
                    utils.response(res, "Something failed", 500);
                };
            });
        } else {
            // Some field was missing
            utils.response(res, "Missing fields", 400);
        };
    };
};
