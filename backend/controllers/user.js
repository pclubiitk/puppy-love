var User = require('../models/user.js');

// Endpoint for creating user
// TODO: Remove in production use
// Usage: http get localhost:8091/api/newUser name="saksham" \
// email="sakshams@iitk.ac.in" roll="14588" ...
exports.newUser = function(mongoose) {
    return function(req, res) {
        var neuMann = new User(mongoose)({
            name: req.body.name,
            email: req.body.email,
            roll: req.body.roll,
            passHash: req.body.passHash,
            pubKey: "def",
            privKey: "poi",
            authCode: "asdasdas"
        });

        neuMann.save(function(err, man) {
            if (err) {
                res.status(501);
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
                                    res.status(501);
                                    res.send(err);
                                } else {
                                    res.send(resp);
                                };
                            });
    };
};
