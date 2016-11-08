var User = require('../models/user.js'),
    utils = require('../controllers/utils.js'),
    messages = utils.messages,
    config = require('../config.js'),
    respond = utils.sendMessage,
    mailer  = require('nodemailer'),
    smtpTransport = require('nodemailer-smtp-transport');;

// Endpoint for creating user
// TODO: Remove in production use
// Usage: http post localhost:8091/api/update/new name="vinayak" \
// roll="14805" passHash="abcd" email="vtantia" gender="1" image="url"
exports.newUser = function(mongoose) {
    return function(req, res) {

        // If the required fields have been sent
        if (utils.reqBodyParse(req, ['roll', 'name',
                                     'image', 'gender',
                                     'email', 'passHash'])) {
            if (req.body.gender === "1") {
                gender = true;
            } else {
                gender = false;
            }
            var neuMann = new User(mongoose)({
                _id: req.body.roll,
                name: req.body.name,
                email: req.body.email,
                gender: gender,
                image: req.body.image,
                passHash: req.body.passHash,
                pubKey: 'def',
                privKey: 'poi',
                authCode: 'asdasdas',
                data: '',
                submitted: false,
                matches: ''
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
                var couldUpdate = p.firstLogin(req.user.roll, req);
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
                var couldUpdate = p.updateData(req.user.roll, req);
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
                var couldUpdate = p.changePassword(req.user.roll, req);
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
        User(mongoose).findById(req.user.roll, function(err, p) {
            if (!p) {
                respond(res, messages.wrongUser);
            } else {
                respond(res, p.getInfoOnLogin(req.user.roll, req));
            };
        });
    };
};

exports.sendEmail = function(mongoose) {

    return function(req, res) {
        User(mongoose).findById(req.body.roll, function(err, p) {
            if (!p) {
                respond(res, messages.wrongUser);
            } else if (!p.authCode) {
                respond(res, messages.badRequestWithData('Already logged in'));
            } else {
                console.log("Sending email");
                var transporter = mailer.createTransport(smtpTransport({
                    host: 'smtp.cc.iitk.ac.in',
                    port: 25,
                    auth: {
                        user: config.emailuser,
                        pass: config.emailpass
                    }}));
                var mailOptions = {
                    from: config.emailuser + '@iitk.ac.in', // sender address
                    to: p.email + '@iitk.ac.in', // list of receivers
                    subject: 'Puppy Love First Login', // Subject line
                    text: ('Your authkey is: ' + p.authCode)
                };
                console.log(mailOptions);
                console.log(config.emailpass);

                transporter.sendMail(mailOptions, function(error, info){
                    if(error){
                        console.log(error);
                        respond(res, messages.dbErrorWithData('Mailing failed'));
                    }else{
                        console.log('Message sent: ' + info.response);
                        respond(res, messages.allFine);
                    };
                });
            };
        });
    };
};
