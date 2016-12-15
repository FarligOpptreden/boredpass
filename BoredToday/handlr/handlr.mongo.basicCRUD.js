var db = require('./handlr.mongo.js');

module.exports = new function () {
    var crud = function (url, collection) {
        var ctx = this;
        this.objectId = db.objectId;
        this.findOne = function (args) {
            var filter = args.filter;
            var sort = args.sort;
            var limit = args.limit;
            var data = args.data;
            var callback = args.callback;
            if (!filter) {
                if (callback)
                    callback(null);
                return;
            }
            db.mongo({
                url: url,
                collection: collection,
                operation: db.operations.find,
                data: data,
                filter: typeof filter === 'object' ? filter : { _id: db.objectId(filter) },
                sort: sort,
                limit: limit,
                callback: function (res) {
                    if (callback)
                        callback(res.data && res.data.length ? res.data[0] : null);
                }
            });
        }
        this.findMany = function (args) {
            var filter = args.filter;
            var sort = args.sort;
            var limit = args.limit;
            var data = args.data;
            var callback = args.callback;
            db.mongo({
                url: url,
                collection: collection,
                operation: db.operations.find,
                data: data,
                filter: filter,
                sort: sort,
                limit: limit,
                callback: function (res) {
                    if (callback)
                        callback(res.data);
                }
            });
        }
        this.page = function (args) {
            var filter = args.filter;
            var sort = args.sort;
            var pageNo = args.pageNo;
            var pageSize = args.pageSize;
            var data = args.data;
            var callback = args.callback;
            db.mongo({
                url: url,
                collection: collection,
                operation: db.operations.pagedData,
                data: data,
                filter: filter,
                sort: sort,
                paging: {
                    pageNo: pageNo,
                    pageSize: pageSize
                },
                callback: function (res) {
                    if (callback)
                        callback(res);
                }
            });
        }
        this.create = function (args) {
            var obj = args.item;
            var callback = args.callback;
            db.mongo({
                url: url,
                collection: collection,
                operation: db.operations.insertOne,
                data: obj,
                callback: function (res) {
                    if (callback)
                        callback(res.data);
                }
            });
        }
        this.update = function (args) {
            var obj = args.item;
            var filter = args.filter;
            var callback = args.callback;
            db.mongo({
                url: url,
                collection: collection,
                operation: db.operations.updateOne,
                filter: typeof filter === 'object' ? filter : { _id: db.objectId(filter) },
                data: obj,
                callback: function (res) {
                    obj = res.data;
                    if (callback)
                        callback(obj);
                }
            });
        }
        this.delete = function (args) {
            var filter = args.filter;
            var callback = args.callback;
            db.mongo({
                url: url,
                collection: collection,
                operation: db.operations.deleteOne,
                filter: typeof filter === 'object' ? filter : { _id: db.objectId(filter) },
                callback: function (res) {
                    if (callback)
                        callback(res);
                }
            });
        }
        this.replaceOperation = function (operation, newHandler) {
            var originalOperation = ctx[operation];
            delete ctx[operation];
            ctx[operation] = function () {
                var args = [];
                for (var a in arguments) {
                    args.push(arguments[a]);
                }
                args.push(originalOperation);
                newHandler.apply(this, args);
            };
        }
    }
    this.get = function (url, collection) {
        return new crud(url, collection);
    }
}