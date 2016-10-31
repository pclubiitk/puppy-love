var User = require('../models/user.js'),
    utils = require('../controllers/utils.js'),
    messages = utils.messages,
    respond = utils.sendMessage;

// Endpoint for creating user
// TODO: Remove in production use
// Usage: http get localhost:8091/api/newUser name="saksham" \
// roll="14588" ...
exports.newUser = function(mongoose) {
    return function(req, res) {

        // If the required fields have been sent
        if (utils.reqBodyParse(req, ['roll', 'name',
                                     'passHash'])) {
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
                    respond(res, messages.dbError);
                } else {
                    respond(res, messages.allFine);
                };
            });
        } else {
            // Some field was missing
            respond(res, messages.missingFields);
        };
    };
};

// Endpoint to get user information
// TODO: Modify to only pass basic info in production
// Usage: http get localhost:8091/api/findUser name="Saksham"
// #security, #important
exports.findUser = function(mongoose) {
    return function(req, res) {
        // If the required fields have been sent
        if (utils.reqBodyParse(req, ['name'])) {
            // All fields present
            User(mongoose).find({name: new RegExp(req.body.name)}, {},
                                function(err, resp) {
                                    if (err) {
                                        res.status(500);
                                        res.send(err);
                                    } else {
                                        // Too much information being sent
                                        res.send(resp);
                                    };
                                });
        } else {
            // Some field was missing
            utils.response(res, "Missing fields", 400);
        };

    };
};

// To be called on first attempt at logging in
exports.firstLogin = function(mongoose) {

    return function(req, res) {
        User(mongoose).findById(req.body.roll, function(err, p) {
            if (!p) {
                respond(res, messages.wrongUser);
            } else {
                // TODO: Extract roll number not from body
                // But instead from the session cookie
                // #security, #important
                var couldUpdate = p.firstLogin(req.body.roll, req);
                if (couldUpdate.success) {
                    // Auth token was correct
                    p.save(function(err) {
                        if (err) {
                            console.error("Couldn't save for: " + req.body.roll);
                            respond(res, messages.dbError);
                        } else {
                            respond(res, messages.couldUpdate);
                        };
                    });
                } else {
                    // Some error
                    respond(res, messages.couldUpdate);
                };
            };
        });
    };
};

// Whenever user wants to update data stored
exports.updateData = function(mongoose) {

    return function(req, res) {
        User(mongoose).findById(req.body.roll, function(err, p) {
            if (!p) {
                respond(res, messages.wrongUser);
            } else {
                // TODO: Extract roll number not from body
                // But instead from the session cookie
                // #security, #important
                var couldUpdate = p.updateData(req.body.roll, req);
                if (couldUpdate.success) {
                    // Auth token was correct
                    p.save(function(err) {
                        if (err) {
                            console.error("Couldn't save for: " + req.body.roll);
                            respond(res, messages.dbError);
                        } else {
                            respond(res, messages.couldUpdate);
                        };
                    });
                } else {
                    // Some error
                    respond(res, messages.couldUpdate);
                };
            };
        });
    };
};

exports.changePassword = function(mongoose) {

    return function(req, res) {
        User(mongoose).findById(req.body.roll, function(err, p) {
            if (!p) {
                respond(res, messages.wrongUser);
            } else {
                // TODO: Extract roll number not from body
                // But instead from the session cookie
                // #security, #important
                var couldUpdate = p.changePassword(req.body.roll, req);
                if (couldUpdate.success) {
                    // Auth token was correct
                    p.save(function(err) {
                        if (err) {
                            console.error("Couldn't save for: " + req.body.roll);
                            respond(res, messages.dbError);
                        } else {
                            respond(res, messages.couldUpdate);
                        };
                    });
                } else {
                    // Some error
                    respond(res, messages.couldUpdate);
                };
            };
        });
    };
};

exports.getInfoOnLogin = function(mongoose) {

    return function(req, res) {
        User(mongoose).findById(req.body.roll, function(err, p) {
            if (!p) {
                respond(res, messages.wrongUser);
            } else {
                // TODO: Extract roll number not from body
                // But instead from the session cookie
                // #security, #important
                // getInfoOnLogin will return a utils.messages message
                return respond(res, p.getInfoOnLogin(req.body.roll, req));
            };
        });
    };
};
