var crypto    = require('crypto'),
    mongoose  = require('mongoose'),
    config    = require('../config.js'),
    utils     = require('../controllers/utils.js'),
    messages  = utils.messages;

require('mongoose-long')(mongoose);

var SchemaTypes = mongoose.Schema.Types,
    hash = crypto.createHash('sha256');

module.exports = function(mongoose) {
    var Schema = mongoose.Schema;

    // The basic model of User
    // Description of each field:
    // _id: Roll number as integer
    // name: Name of the user
    // passHash: A non-invertible hash of the password and user's roll
    //           Adding user's roll number prevents rainbow table attacks
    // pubKey: Public key, accessible to all
    // privKey: Password encrypted private key
    // authCode: To be used for initial login and email based recovery
    // data: Personal temporary data encrypted by private key
    //       Never can be decrypted outside the user's own browser
    //       Contains choices of user prior to submitting
    var userSchema = new Schema({
        _id: SchemaTypes.Long,  // Roll number
        name: String,
        passHash: String,
        pubKey: String,
        privKey: String,
        authCode: String,
        data: String,
        submitted: Boolean
    });

    // Match the hashes
    // TODO: Can we do better, be safer?
    userSchema.methods.validPassword = function(password) {
        return (this.passHash === password);
    };

    // Wrapper for all functions to be protected
    // by authorization (authentication is still handled by passport.js)
    userSchema.methods.authorized = function(roll) {
        if (roll !== this._id) {
            return false;
        } else {
            return true;
        };
    };

    userSchema.methods.firstLogin = function(roll, req) {
        if (!this.authorized(roll)) {
            return messages.unauthorized;
        } else {
            // First verify all fields are present
            if (!utils.reqBodyParse(req,
                                    'authCode', 'passHash',
                                    'pubKey', 'privKey')) {
                return messages.missingFields;
            } else {
                // Request is well formed
                if (req.body.authCode !== this.authCode) {
                    return messages.wrongAuthCode;
                } else {
                    this.authCode = null;
                    this.passHash = req.body.passHash;
                    this.pubKey = req.body.pubKey;
                    this.privKey = req.body.privKey;

                    this.data = '';
                    this.submitted = false;
                    return messages.allFine;
                };
            };
        };
    };

    // This function also needs to update the stored private key
    // Since the stored private key and data is password encrypted
    userSchema.methods.changePassword = function(roll, req) {
        if (!this.authorized(roll)) {
            return messages.unauthorized;
        } else {
            // Verify fields needed
            if (!utils.reqBodyParse(req,
                                    ['passHash', 'pubKey', 'data'])) {
                return messages.missingFields;
            } else {
                // Request is well formed
                this.passHash = req.body.passHash;
                this.privKey = req.body.privKey;
                this.data = req.body.data;
                return messages.allFine;
            };
        };
    };

    // Send out user's information on login
    userSchema.methods.getInfoOnLogin = function(roll, req) {
        // No fields are needed in this case
        if (!this.authorized(roll)) {
            return messages.unauthorized;
        } else {
            return messages.allFineWithData({
                name: this.name,
                privKey: this.privKey,
                data: this.data,
                submitted: this.submitted
            });
        };
    };

    // Update the info stored
    userSchema.methods.updateData = function(roll, req) {
        if (!this.authorized(roll)) {
            return messages.unauthorized;
        } else {
            if (!utils.reqBodyParse(req, ['data'])) {
                return messages.missingFields;
            } else {
                this.data = req.body.data;
                return messages.allFine;
            };
        };
    };

    // Use some random data to prevent forging
    userSchema.methods.getAuthCode = function() {
        var token = crypto.randomBytes(16).toString('hex');
        hash.update(token + this.name + config.secret);
        var result = hash.digest('hex');
        this.authCode = result;
        return result;
    };

    // Return new model or create one
    if (mongoose.models.User) {
        return mongoose.model('User');
    } else {
        return mongoose.model('User', userSchema);
    };
};
