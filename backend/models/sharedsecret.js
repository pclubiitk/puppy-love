var crypto   = require('crypto'),
    config   = require('../config.js'),
    mongoose = require('mongoose');

require('mongoose-long')(mongoose);

var SchemaTypes = mongoose.Schema.Types;

module.exports = function(mongoose) {
    var Schema = mongoose.Schema;

    // Schema for containing the shared secret
    // negotiated between parties
    // The ID is unique, and both parties agree on this:
    // Id will be (smaller roll number) ++ "$" ++ (larger roll number)
    // As for the secret, it will be used to implement homomorphic
    // computation. A possible solution being considered is a shared
    // public private RSA key pair
    //
    // This type is trivial on perfomance, since one would simply
    // generate the IDs to query for. Each person, on pressing 'submit',
    // will cause 2-3 seconds of DB time.
    // TODO: Can we optimize this in a better way?
    var sharedSecret = new Schema({
        _id: String,  // Roll number of (sender++target)
        person1: SchemaTypes.Long, // Roll number of sender
        person2: SchemaTypes.Long, // Roll number of target person
        secret1: String,
        secret2: String,        // 3 of these for
        secret3: String         // possible future use
    });

    // WARN: Possible race condition.
    // Both users may call this function, which will execute.
    // But one person will 'save' early on, and then the other will save
    // Both will get different values
    // One possible solution is to enforce a limit, that the user will
    // need to wait for a small amount of time (2 minutes)
    // on signing up (and thus, generating the shared secrets with everyone)
    // before he can submit his/her choices
    // TODO: Enforce access restrictions to this call
    sharedSecret.methods.defineSecret = function(_secret1, _secret2, _secret3) {
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
        return mongoose.model('SharedSecret');
    } else {
        return mongoose.model('SharedSecret', sharedSecret);
    };
};
