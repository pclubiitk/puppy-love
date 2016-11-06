var crypto   = require('crypto'),
    config   = require('../config.js'),
    mongoose = require('mongoose');

require('mongoose-long')(mongoose);

var SchemaTypes = mongoose.Schema.Types;

module.exports = function(mongoose) {
    var Schema = mongoose.Schema;

    // There shall be (no of males * no of females) entries in this type
    // Each entry will signify the message from sender to target
    // TODO: Are queries like (all entries from/to person A) fast enough?

    // Schema for containing the secret
    // communication between parties
    var twoParty = new Schema({
        _id: String,  // Roll numbers appended (in alphabetical order)
        sender: Number, // Roll number of garbler (sender)
        receiver: Number, // Roll number of evaluator (receiver)

        // The state/step of computation between these two people
        state: Number,
        senderSubmitted: Boolean,
        receiverSubmitted: Boolean,

        // Step 1 information
        // Happens whenever one of the two people
        // logs in for the first time.
        privateServerMap: Object,
        privateSenderInfo: String,
        infoForReceiver: String,

        // Step 2 information
        // Only happens after receiver submits
        oblivTransferV: String,
        oblivTransferKB: String, // Encrypted k value

        // Step 2-2 information
        // Sender has submitted.
        // Does not stop step 3
        senderChoice: String,

        // Step 3 information
        // Only happens after step 2
        oblivTransferPrime: String,

        // Step 4 information
        // Once string from receiver is known
        // the answer is found.
        // Requires step 3 and step 2-2
        valueFromReceiver: String,

        // Step 5
        // Send only at the last moment
        matched: Boolean
    });

    // Receiver has chosen, and sends a V, K, B.
    // Sender should NOT know K, B
    twoParty.methods.recvStep2 = function(req) {
        // First verify all fields are present
        if (!utils.reqBodyParse(req, 'v', 'kb')) {
            return messages.missingFields;
        } else {
            // Request is well formed
            if (this.receiverSubmitted !== false &&
                this.state == 1) {

                this.receiverSubmitted = true;
                this.oblivTransferV = req.body.v;
                this.oblivTransferKB = req.body.kb;

                this.state = 2;

                return messages.allFine;

            } else {

                if (this.receiverSubmitted === true) {
                    return messages.aleadyExists;
                } else {
                    return messages.badRequestWithData('Wrong state');
                }
            }
        };
    };

    // Sender sends its choice
    twoParty.methods.senderStep2 = function(req) {
        if (!utils.reqBodyParse(req, 'senderChoice')) {
            return messages.missingFields;
        } else {
            // No state checks needed here
            if (this.senderSubmitted !== false) {

                this.senderSubmitted = true;
                this.senderChoice = req.body.senderChoice;
                return messages.allFine;
            } else {
                return messages.badRequestWithData('Sender already submitted');
            }
        }
    }

    // Sender responds to oblivious computation request
    twoParty.methods.senderStep3 = function(req) {
        if (!utils.reqBodyParse(req, 'oblivPrime')) {
            return messages.missingFields;
        } else {

            if (this.oblivTransferPrime !== '' &&
                this.state == 2) {

                this.oblivTransferPrime = req.body.oblivPrime;

                this.state = 3;

                return messages.allFine;
            } else {
                return messages.badRequestWithData('Wrong state');
            }
        }
    }

    // Receiver has computed the result
    twoParty.methods.recvStep4 = function(req) {
        if (!utils.reqBodyParse(req, 'value')) {
            return messages.missingFields;
        } else {
            if (this.senderSubmitted !== true ||
                this.receiverSubmitted !== true ||
                this.state !== 3) {

                return messages.badRequestWithData('Wrong state');
            } else {
                // The moment of truth
                if (this.privateServerMap.hasOwnProperty(req.value)) {
                    // A valid result was computed
                    result = this.privateServerMap[req.value];
                    if (result) {
                        this.matched = true;
                    } else {
                        this.matched = false;
                    }

                    this.state = 4;

                    // Do not inform of the result just yet.
                    return messages.allFine;
                } else {
                    return messages.badRequestWithData('Missing key in server');
                }
            }
        }
    }

    // Return new model or create one
    if (mongoose.models.TwoPartyComm) {
        return mongoose.model('TwoPartyComm');
    } else {
        return mongoose.model('TwoPartyComm', twoParty);
    };
};
