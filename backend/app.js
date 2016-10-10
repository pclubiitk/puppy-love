var express    = require('express'),
    logger     = require('morgan'),
    bodyParser = require('body-parser');

// Returns the express app

var app = express();
app.use(logger('short'));
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));

module.exports = app;
