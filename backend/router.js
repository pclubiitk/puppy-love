var express    = require('express'),
    requireDir = require('require-dir'),
    assert     = require('assert');

var config      = require('./config.js'),
    controllers = requireDir('./controllers');

module.exports = function(db) {
    router = express.Router();

    router.get('/test', function(req, res) {
        res.send('Health test');
    });

    router.post('/register', controllers.genkey.register(db));
    router.post('/newUser', controllers.user.newUser(db));
    router.get('/findUser', controllers.user.findUser(db));

    return router;
};
