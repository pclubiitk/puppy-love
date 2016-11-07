var TwoPartyComm = require('../models/twopartycomm.js'),
    User = require('../models/user.js'),
    utils = require('../controllers/utils.js'),
    messages = utils.messages,
    respond = utils.sendMessage;

// Endpoint for creating an entry for twopartycomm
// Usage: http post localhost:8091/api/twoparty/new
// sender="14588" receiver="14900" serverMap="abcd"
// senderInfo="efgh" recvInfo="ijkl"
exports.newEntry = function(mongoose) {
    return function(req, res) {

        // If the required fields have been sent
        if (utils.reqBodyParse(req, ['sender',
                                     'receiver',
                                     'serverMap',
                                     'senderInfo',
                                     'recvInfo']) &&
            req.body.receiver !== req.body.sender &&
            parseInt(req.body.sender) && parseInt(req.body.receiver)) {

            // What actually creates the table entry
            var createEntry = function(err) {

                // If gender matching threw an error
                if (err) {
                    respond(err);
                } else {
                    // Fix an ordering of people
                    if (parseInt(req.body.sender) < parseInt(req.body.receiver)) {
                        id = (req.body.sender + '-' + req.body.receiver);
                    } else {
                        id = (req.body.receiver + '-' + req.body.sender);
                    }

                    // neuerEntrag means new-entry :P
                    var neuerEntrag = new TwoPartyComm(mongoose)({
                        _id: id,
                        sender: parseInt(req.body.sender),
                        receiver: parseInt(req.body.receiver),
                        state: 1,
                        senderSubmitted: false,
                        receiverSubmitted: false,
                        privateServerMap: req.body.serverMap,
                        privateSenderInfo: req.body.senderInfo,
                        infoForReceiver: req.body.recvInfo,
                        oblivTransferV: '',
                        oblivTransferKB: '',
                        senderChoice: '',
                        oblivTransferPrime: '',
                        valueFromReceiver: '',
                        matched: undefined
                    });

                    neuerEntrag.save(function(err, entry) {
                        if (err) {
                            console.error(err);
                            respond(res, messages.dbError);
                        } else {
                            respond(res, messages.allFine);
                        };
                    });
                }
            };

            // Authorize and call above functions bottom to top
            if (req.body.sender == req.user.roll) {
                // verifyGender calls createEntry after verifying
                // that the genders are different.
                // Either of those functions will return a message for response
                utils.verifyGender(parseInt(req.body.sender),
                                   parseInt(req.body.receiver),
                                   mongoose, User, createEntry);
            } else {
                respond(res, messages.unauthorized);
            }
        } else {
            // Some field was missing
            respond(res, messages.missingFields);
        };
    };
};

// Create objects in bulk
exports.newBulk = function(mongoose) {
    return function(req, res) {

        var looper = function(obj) {
            // If the required fields have been sent

            if (utils.objParse(obj, ['sender',
                                     'receiver',
                                     'serverMap',
                                     'senderInfo',
                                     'recvInfo']) &&
                obj.receiver !== obj.sender &&
                parseInt(obj.sender) && parseInt(obj.receiver)) {

                // What actually creates the table entry
                var createEntry = function(err) {

                    // If gender matching threw an error
                    if (err) {
                        // respond(err);
                        console.log("Gender matching error");
                    } else {
                        // Fix an ordering of people
                        if (parseInt(obj.sender) < parseInt(obj.receiver)) {
                            id = (obj.sender + '-' + obj.receiver);
                        } else {
                            id = (obj.receiver + '-' + obj.sender);
                        }

                        // neuerEntrag means new-entry :P
                        var neuerEntrag = new TwoPartyComm(mongoose)({
                            _id: id,
                            sender: parseInt(obj.sender),
                            receiver: parseInt(obj.receiver),
                            state: 1,
                            senderSubmitted: false,
                            receiverSubmitted: false,
                            privateServerMap: obj.serverMap,
                            privateSenderInfo: obj.senderInfo,
                            infoForReceiver: obj.recvInfo,
                            oblivTransferV: '',
                            oblivTransferKB: '',
                            senderChoice: '',
                            oblivTransferPrime: '',
                            valueFromReceiver: '',
                            matched: undefined
                        });

                        neuerEntrag.save(function(err, entry) {
                            if (err) {
                                console.error(err);
                            } else {
                                console.log("Saved ID: " + id);
                            };
                        });
                    }
                };

                // Authorize and call above functions bottom to top
                if (obj.sender == req.user.roll) {
                    // verifyGender calls createEntry after verifying
                    // that the genders are different.
                    // Either of those functions will return a message for response
                    utils.verifyGender(parseInt(obj.sender),
                                       parseInt(obj.receiver),
                                       mongoose, User, createEntry);
                } else {
                    // respond(res, messages.unauthorized);
                    console.log("Unauthorized");
                }
            } else {
                // Some field was missing
                // respond(res, messages.missingFields);
                console.log("Missing fields");
            };
        };


        // Loop over provided items
        for (var person in req.body.people) {
            if (req.body.people.hasOwnProperty(person)) {
                looper(req.body.people[person]);
            };
        };

        // TODO: Does this work fine?
        // Will the loop still run?
        respond(messages.allFine);
    };
};


// Naming convention to be followed for crypto functions:
// Functions like rStepX mean the step X, which expects an action
// from receiver.
// Similarly, sStepX expects an action from sender

exports.rStep2 = function(mongoose) {
    return function(req, res) {

        // If the required fields have been sent
        if (utils.reqBodyParse(req, ['id', 'v', 'kb'])) {

            var runRecv = function(resp) {
                respond(res, resp.recvStep2(req));
            };

            // Authorize and call above function
            // Receiver should be this guy
            TwoPartyComm(mongoose).findById(
                req.body.id,
                function(err, resp) {
                    if (err) {
                        respond(res, messages.wrongUser);
                    } else {
                        if (resp.checkRecvAuth(req.user.roll)) {
                            runRecv(resp);
                        } else {
                            respond(res, messages.unauthorized);
                        }
                    };
                });
        } else {
            // Some field was missing
            respond(res, messages.missingFields);
        };
    };
};

exports.sStep2 = function(mongoose) {
    return function(req, res) {

        // If the required fields have been sent
        if (utils.reqBodyParse(req, ['id', 'senderChoice'])) {

            var runSender = function(resp) {
                respond(res, resp.senderStep2(req));
            };

            // Authorize and call above function
            // This guy should be sender
            TwoPartyComm(mongoose).findById(
                req.body.id,
                function(err, resp) {
                    if (err) {
                        respond(res, messages.wrongUser);
                    } else {
                        if (resp.checkSendAuth(req.user.roll)) {
                            runSender(resp);
                        } else {
                            respond(res, messages.unauthorized);
                        }
                    };
                });
        } else {
            // Some field was missing
            respond(res, messages.missingFields);
        };
    };
};

exports.sStep3 = function(mongoose) {
    return function(req, res) {

        // If the required fields have been sent
        if (utils.reqBodyParse(req, ['id', 'sender',
                                     'receiver', 'oblivPrime'])) {

            var runSender = function(resp) {
                respond(res, resp.senderStep3(req));
            };

            // Authorize and call above function
            TwoPartyComm(mongoose).findById(
                req.body.id,
                function(err, resp) {
                    if (err) {
                        respond(res, messages.wrongUser);
                    } else {
                        if (resp.checkSendAuth(req.user.roll)) {
                            runSender(resp);
                        } else {
                            respond(res, messages.unauthorized);
                        }
                    };
                });
        } else {
            // Some field was missing
            respond(res, messages.missingFields);
        };
    };
};

exports.rStep4 = function(mongoose) {
    return function(req, res) {

        // If the required fields have been sent
        if (utils.reqBodyParse(req, ['id', 'sender',
                                     'receiver', 'value'])) {

            var runRecv = function(resp) {
                respond(res, resp.recvStep4(req));
            };

            // Authorize and call above function
            TwoPartyComm(mongoose).findById(
                req.body.id,
                function(err, resp) {
                    if (err) {
                        respond(res, messages.wrongUser);
                    } else {
                        if (resp.checkRecvAuth(req.user.roll)) {
                            runRecv(resp);
                        } else {
                            respond(res, messages.unauthorized);
                        }
                    };
                });
        } else {
            // Some field was missing
            respond(res, messages.missingFields);
        };
    };
};

exports.displayAll = function(mongoose) {
    return function(req, res) {

        // If the required fields have been sent
        if (utils.reqBodyParse(req, ['id'])) {

            var runRecv = function(resp) {
                respond(res, messages.allFineWithData(resp));
            };

            // Authorize and call above function
            TwoPartyComm(mongoose).findById(req.body.id,
                                            function(err, resp) {
                                                if (err) {
                                                    respond(messages.wrongUser);
                                                } else {
                                                    runRecv(resp);
                                                };
                                            });
        } else {
            // Some field was missing
            respond(res, messages.missingFields);
        };
    };
};
