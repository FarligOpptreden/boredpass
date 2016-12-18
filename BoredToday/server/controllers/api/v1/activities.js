var requireRoot = 'root/../..';
var service = require(requireRoot + '/server/services/activities.js');
var handlr = require(requireRoot + '/handlr/handlr.controller.basicCRUD.js').get(
    '/api/v1/activities', 
    service,
    {
        searchFields: ['name', 'location'],
        sortFields: { '_created': -1, 'name': 1 }
    }
);

module.exports = handlr;