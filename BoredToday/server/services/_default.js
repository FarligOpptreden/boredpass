var _activities = require('./activities.js');

module.exports = new function () {
    var ctx = this;
    this.recommendedActivities = function (args) {
        _activities.page({
            pageSize: 20,
            pageNo: args.pageNo,
            sort: { _created: -1 },
            callback: args.callback
        });
    };
};