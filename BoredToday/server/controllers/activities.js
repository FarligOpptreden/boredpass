var service = require('../services/activities.js');
var handlr = require('../../handlr/handlr.controller.basicCRUD.js').get(
    '/activities', 
    service,
    {
        searchFields: ['name', 'location', 'date'],
        sortFields: { '_created': -1, 'name': 1 }
    }
);

module.exports = handlr;