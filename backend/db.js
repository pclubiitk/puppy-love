var MongoClient = require('mongodb').MongoClient,
    config = require('./config.js');

exports.connectAndRun = function(callback) {
    MongoClient.connect(config.mongo.url, function(err, database) {
        if (err) return console.error(err);
        db = database;
        callback(db);
    });
};
