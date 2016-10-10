var crypto   = require('crypto'),
    config   = require('../config.js'),
    mongoose = require('mongoose');

require('mongoose-long')(mongoose);

var SchemaTypes = mongoose.Schema.Types,
    hash = crypto.createHash('sha256');

module.exports = function(mongoose) {
    var Schema = mongoose.Schema;

    // The basic model of User
    var userSchema = new Schema({
        _id: SchemaTypes.Long,  // Roll number
        name: String,
        passHash: String,
        pubKey: String,
        privKey: String,
        authCode: String
    });

    // Use some random data to prevent forging
    userSchema.methods.getAuthCode = function() {
        var token = crypto.randomBytes(16).toString('hex');
        hash.update(token + this.name + config.secret);
        var result = hash.digest('hex');
        this.authCode = result;
        return result;
    };

    // The only functionality to be provided
    userSchema.methods.updateInfo = function(suppliedCode, s_pass, s_pub, s_priv) {
        if (this.authCode === suppliedCode) {
            this.passHash = s_pass;
            this.pubKey = s_pub;
            this.privKey = s_priv;
            return true;
        } else {
            return false;
        }
    };

    // Return new model or create one
    if (mongoose.models.User) {
        return mongoose.model('User');
    } else {
        return mongoose.model('User', userSchema);
    };
};
