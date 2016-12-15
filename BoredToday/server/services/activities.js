var config = require('../../config.js');
var db = require('../../handlr/handlr.mongo.basicCRUD.js').get(config.connectionStrings.boredToday, 'activities');

module.exports = db;