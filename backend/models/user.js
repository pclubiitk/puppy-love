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
        name: String,
        email: String,
        roll: SchemaTypes.Long,
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

    // Used to verify auth code
    userSchema.methods.verifyAuthCode = function(suppliedCode) {
        return (this.authCode === suppliedCode);
    };

    // Return new model or create one
    if (mongoose.models.User) {
        return mongoose.model('User');
    } else {
        return mongoose.model('User', userSchema);
    };
};
