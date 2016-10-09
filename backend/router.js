var express    = require('express'),
    requireDir = require('require-dir'),
    assert     = require('assert');

var config      = require('./config.js'),
    controllers = requireDir('./controllers');

// Dummy example function
var insertDocuments = function(db) {
    return function(req, res) {
        // Get the documents collection
        var collection = db.collection('documents');
        // Insert some documents
        collection.insertMany([
            {a : 1}, {a : 2}, {a : 3}
        ], function(err, result) {
            assert.equal(err, null);
            assert.equal(3, result.result.n);
            assert.equal(3, result.ops.length);
            console.log("Inserted 3 documents into the collection");
            res.send(result);
        });
    }
};

module.exports = function(db) {
    router = express.Router();

    router.get('/test', function(req, res) {
        res.send('Health test');
    });

    router.post('/register', controllers.genkey.register(db));
    router.get('/insert', insertDocuments(db));

    return router;
};
