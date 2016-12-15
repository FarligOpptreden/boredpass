var _activities = require('./activities.js');

module.exports = new function () {
    var ctx = this;
    this.recommendedActivities = function (args) {
        _activities.findMany({
            callback: args.callback
        });
    };
};