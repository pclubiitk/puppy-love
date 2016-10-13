var crypto   = require('crypto'),
    config   = require('../config.js'),
    mongoose = require('mongoose');

require('mongoose-long')(mongoose);

var SchemaTypes = mongoose.Schema.Types;

module.exports = function(mongoose) {
    var Schema = mongoose.Schema;

    // There shall be (no of men * no of women * 2) entries in this type
    // Each entry will signify the message from sender to target
    // TODO: Are queries like (all entries from/to person A) fast enough?

    // Schema for containing the secret
    // communication between parties
    var twoParty = new Schema({
        _id: SchemaTypes.Long,  // Roll number of (sender++target)
        sender: SchemaTypes.Long, // Roll number of sender
        target: SchemaTypes.Long, // Roll number of target person
        secret1: String,
        secret2: String,        // 3 of these for
        secret3: String         // possible future use
    });

    // This is safe from race conditions, since only one person
    // is allowed to write values to this entry in the DB, that
    // is, the sender
    // TODO: Enforce access restrictions to this call
    twoParty.methods.setSecret = function(_secret1, _secret2, _secret3) {
        if (_secret1 !== undefined && this.secret1 !== null) {
            this.secret1 = _secret1;
        };

        if (_secret2 !== undefined && this.secret2 !== null) {
            this.secret2 = _secret2;
        };

        if (_secret3 !== undefined && this.secret3 !== null) {
            this.secret1 = _secret3;
        };

        return (this.secret1, this.secret2, this.secret3);
    };


    // Return new model or create one
    if (mongoose.models.User) {
        return mongoose.model('TwoPartyComm');
    } else {
        return mongoose.model('TwoPartyComm', twoParty);
    };
};
