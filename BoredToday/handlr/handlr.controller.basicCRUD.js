var handlr = require('./handlr.controller.js');

module.exports = new function () {
    this.get = function (resourceContext, service, args) {
        var findLimit = args && args.findLimit ? args.findLimit : 20;
        var pageSize = args && args.pageSize ? args.pageSize : 30;
        var searchFields = args && args.searchFields ? args.searchFields : ['name'];
        var sortFields = args && args.sortFields ? args.sortFields : { 'name': 1 };
        var buildFilter = function (search) {
            if (!searchFields || !search)
                return null;
            var filter = { $or: [] };
            searchFields.forEach(function (field, i) {
                var filterOption = {};
                filterOption[field] = { $regex: '.*' + search + '.*', $options: 'i' };
                filter.$or.push(filterOption);
            });
            return filter;
        };
        var buildSort = function () {
            if (!sortFields)
                return null;
            return sortFields;
        };
        var controllers = handlr.Get(resourceContext)
        // Page service data
        .handle({ route: '/page/:pageNo', method: 'get', produces: 'json' }, function (req, res) {
            service.page({
                filter: buildFilter(req.query.search),
                sort: buildSort(),
                pageNo: req.params.pageNo,
                pageSize: req.query.pagesize ? req.query.pagesize : pageSize,
                callback: function (pagedData) {
                    res.json(pagedData);
                }
            });
        })
        // Find many service data
        .handle({ route: '/', method: 'get', produces: 'json' }, function (req, res) {
            service.findMany({
                filter: buildFilter(req.query.search),
                sort: buildSort(),
                limit: findLimit,
                callback: function (objs) {
                    res.json(objs);
                }
            });
        })
        // Create service data
        .handle({ route: '/', method: 'post', produces: 'json', consumes: 'json' }, function (req, res) {
            service.create({
                item: req.body,
                callback: function (obj) {
                    res.json(obj);
                }
            });
        })
        // Find single service data
        .handle({ route: '/:uuid', method: 'get', produces: 'json' }, function (req, res) {
            var sort = buildSort();
            service.findOne({
                filter: req.params.uuid,
                sort: buildSort(),
                limit: findLimit,
                callback: function (obj) {
                    res.json(obj);
                }
            });
        })
        // Update service data
        .handle({ route: '/:uuid', method: 'put', produces: 'json', consumes: 'json' }, function (req, res) {
            service.update({
                item: req.body,
                filter: req.params.uuid,
                callback: function (obj) {
                    res.json(obj);
                }
            });
        })
        // Delete service data
        .handle({ route: '/:uuid', method: 'delete', produces: 'json', consumes: 'json' }, function (req, res) {
            service.delete({
                filter: req.params.uuid,
                callback: function (obj) {
                    res.json(obj);
                }
            });
        });
        return controllers;
    }
}