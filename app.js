var express    = require('express'),
    logger     = require('morgan'),
    bodyParser = require('body-parser');

// Returns the express app

var app = express();
app.use(logger('short'));
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));

var allowCrossDomain = function(req, res, next) {
    res.header('Access-Control-Allow-Origin', 'example.com');
    res.header('Access-Control-Allow-Methods', 'GET,PUT,POST,DELETE');
    res.header('Access-Control-Allow-Headers', 'Content-Type');
    next();
}
app.use(allowCrossDomain);
app.use('/', express.static('views'))

module.exports = app;
