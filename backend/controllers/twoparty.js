var TwoPartyComm = require('../models/twopartycomm.js'),
    User = require('../models/user.js'),
    utils = require('../controllers/utils.js'),
    messages = utils.messages,
    respond = utils.sendMessage;

// Endpoint for creating an entry for twopartycomm
// Usage: http post localhost:8091/api/twoparty/new
// id="14588-14900" sender="14588" receiver="14900"
exports.newEntry = function(mongoose) {
    return function(req, res) {

        // If the required fields have been sent
        if (utils.reqBodyParse(req, ['id', 'sender',
                                     'receiver',
                                     'serverMap',
                                     'senderInfo',
                                     'recvInfo']) &&
            req.body.receiver !== req.body.sender) {

            // What actually creates the table entry
            var createEntry = function() {

                // Fix an ordering of people
                if (parseInt(req.body.sender) > parseInt(req.body.receiver)) {
                    id = (req.body.sender + req.body.receiver);
                } else {
                    id = (req.body.receiver + req.body.sender);
                }

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
                        return messages.dbError;
                    } else {
                        return messages.allFine;
                    };
                });
            };

            // Authorize and call above functions bottom to top
            if (req.body.sender == req.user.roll) {
                // verifyGender calls createEntry after verifying
                // that the genders are different.
                // Either of those functions will return a message for response
                respond(utils.verifyGender(res.body.sender, res.body.receiver,
                                           mongoose, createEntry()));
            } else {
                respond(res, messages.unauthorized);
            }
        } else {
            // Some field was missing
            respond(res, messages.missingFields);
        };
    };
};

// Naming convention to be followed for crypto functions:
// Functions like rStepX mean the step X, which expects an action
// from receiver.
// Similarly, sStepX expects an action from sender

exports.rStep2 = function(mongoose) {
    return function(req, res) {

        // If the required fields have been sent
        if (utils.reqBodyParse(req, ['id', 'sender',
                                     'receiver', 'v', 'kb'])) {

            var runRecv = function(resp) {
                respond(res, resp.recvStep2(req));
            }

            // Authorize and call above function
            if (req.body.receiver == req.user.roll) {
                TwoPartyComm(mongoose).find({sender: req.body.sender,
                                             receiver: req.body.receiver},
                                            function(err, resp) {
                                                if (err) {
                                                    respond(messages.wrongUser);
                                                } else {
                                                    runRecv(resp);
                                                };
                                            });
            } else {
                respond(messages.unauthorized);
            }
        } else {
            // Some field was missing
            respond(res, messages.missingFields);
        };
    };
};

exports.sStep2 = function(mongoose) {
    return function(req, res) {

        // If the required fields have been sent
        if (utils.reqBodyParse(req, ['id', 'sender',
                                     'receiver', 'senderChoice'])) {

            var runSender = function(resp) {
                respond(res, resp.senderStep2(req));
            }

            // Authorize and call above function
            if (req.body.sender == req.user.roll) {
                TwoPartyComm(mongoose).find({sender: req.body.sender,
                                             receiver: req.body.receiver},
                                            function(err, resp) {
                                                if (err) {
                                                    respond(messages.wrongUser);
                                                } else {
                                                    runSender(resp);
                                                };
                                            });
            } else {
                respond(messages.unauthorized);
            }
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
            }

            // Authorize and call above function
            if (req.body.sender == req.user.roll) {
                TwoPartyComm(mongoose).find({sender: req.body.sender,
                                             receiver: req.body.receiver},
                                            function(err, resp) {
                                                if (err) {
                                                    respond(messages.wrongUser);
                                                } else {
                                                    runSender(resp);
                                                };
                                            });
            } else {
                respond(messages.unauthorized);
            }
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
            }

            // Authorize and call above function
            if (req.body.receiver == req.user.roll) {
                TwoPartyComm(mongoose).find({sender: req.body.sender,
                                             receiver: req.body.receiver},
                                            function(err, resp) {
                                                if (err) {
                                                    respond(messages.wrongUser);
                                                } else {
                                                    runRecv(resp);
                                                };
                                            });
            } else {
                respond(messages.unauthorized);
            }
        } else {
            // Some field was missing
            respond(res, messages.missingFields);
        };
    };
};

exports.displayAll = function(mongoose) {
    return function(req, res) {

        // If the required fields have been sent
        if (utils.reqBodyParse(req, ['id', 'sender',
                                     'receiver'])) {

            var runRecv = function(resp) {
                respond(res, messages.allFineWithData(resp));
            }

            // Authorize and call above function
            TwoPartyComm(mongoose).find({sender: req.body.sender,
                                         receiver: req.body.receiver},
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
}
