/*eslint no-process-env: 0*/
/*eslint no-undef: 0*/

var config = {};

config.web = {};
config.web.host = "0.0.0.0";
config.web.port = 8091;

config.mongo = {};
config.mongo.url = "mongodb://0.0.0.0:27017/puppy";

module.exports = config;
