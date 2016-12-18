var handlr = require('../../handlr/handlr.controller.js');
var service = require('../services/_default.js');

module.exports = handlr.Get('/')
// Show default index page
.handle({ route: '/', method: 'get', produces: 'html' }, function (req, res) {
    service.recommendedActivities({
        pageNo: 1,
        callback: function (activities) {
            res.render('_default', {
                title: 'Activities Near You - Bored Today',
                activities: activities
            });
        }
    });
});