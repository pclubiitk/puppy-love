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
                if (parseInt(req.body.sender) > parseInt(req.body.receiver)) {
                    id = parseInt(req.body.sender + req.body.receiver);
                } else {
                    id = parseInt(req.body.receiver + req.body.sender);
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
                        respond(res, messages.dbError);
z                    } else {
                        respond(res, messages.allFine);
                    };
                });
            }

            // Check if the gender of receiver and sender is same
            var findReceiver = function(senderGender) {
                User(mongoose).find(req.body.receiver,
                                    function(err, resp) {
                                        if (err) {
                                            respond(messages.wrongUser);
                                        } else {
                                            if (senderGender != resp.gender) {
                                                createEntry();
                                            } else {
                                                respond(res, messages.badRequest);
                                            }
                                        };
                                    });
            }

            // Find gender of sender
            var findSender = function() {
                User(mongoose).findById(req.body.sender,
                                        function(err, resp) {
                                            if (err) {
                                                respond(messages.wrongUser);
                                            } else {
                                                findReceiver(resp.gender);
                                            };
                                        });
            }

            // Authorize and call above functions bottom to top
            if (req.body.sender == req.user.roll) {
                findSender();
            } else {
                respond(messages.unauthorized);
            }
        } else {
            // Some field was missing
            respond(res, messages.missingFields);
        };
    };
};

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
