var mongoose = require('mongoose'),
    config   = require('./config.js');

exports.connectAndRun = function(callback) {
    mongoose.connect(config.mongo.url);
    var db = mongoose.connection;
    db.on('error', console.error.bind(console, 'connection error:'));

    db.once('open', callback(mongoose));
};
