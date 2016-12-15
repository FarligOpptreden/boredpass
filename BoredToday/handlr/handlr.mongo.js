var mongo = require('mongodb');
var moment = require('moment');

module.exports = new function () {
    var ctx = this;
    this.objectId = function (args) {
        return new mongo.ObjectID(args);
    }
    this.mongo = function (args) {
        var client = mongo.MongoClient;
        if (args.data)
            for (var k in args.data) {
                if (k === '_id' && mongo.ObjectID.isValid(args.data[k]))
                    args.data[k] = ctx.objectId(args.data[k]);
            }
        if (args.filter)
            for (var k in args.filter) {
                if (k === '_id' && mongo.ObjectID.isValid(args.filter[k]))
                    args.filter[k] = ctx.objectId(args.filter[k]);
            }
        var toLog = '';
        toLog += '[H:i:' + moment().format('YYYY-MM-DDTHH:mm:ss:SSS') + '] Executing MongoDB statement';
        toLog += '\n    > Url        : ' + args.url;
        toLog += '\n    > Collection : ' + args.collection;
        toLog += '\n    > Operation  : ' + args.operation;
        toLog += '\n    > Filter     : ' + JSON.stringify(args.filter);
        toLog += '\n    > Data       : ' + JSON.stringify(args.data);
        toLog += '\n    > Sort       : ' + JSON.stringify(args.sort);
        toLog += '\n    > Project    : ' + JSON.stringify(args.project);
        toLog += '\n    > Group      : ' + JSON.stringify(args.group);
        toLog += '\n    > Skip       : ' + JSON.stringify(args.skip);
        toLog += '\n    > Limit      : ' + JSON.stringify(args.limit);
        toLog += '\n    > Pipeline   : ' + JSON.stringify(args.pipeline);
        console.log(toLog);
        var execute = function (db, callback) {
            var operation = args.operation;
            if (operation === ctx.operations.pagedData)
                operation = ctx.operations.find;
            var col = db.collection(args.collection);
            var evalResultSet = function (cursor, callback) {
                var objs = [];
                cursor.each(function (err, res) {
                    if (res != null)
                        objs.push(res);
                    else
                        callback({ data: objs }, true);
                });
            }
            var doFind = function () {
                var results = col.find(args.filter, args.data);
                if (args.sort)
                    results = results.sort(args.sort);
                if (args.skip)
                    results = results.skip(args.skip);
                if (args.limit)
                    results = results.limit(args.limit);
                evalResultSet(results, callback);
            }
            var doPagedData = function () {
                if (!args.paging) {
                    callback('Paging parameters not specified for "pagedData" Mongo Handlr', false);
                    return;
                }
                if (!args.paging.pageNo) {
                    callback('"pageNo" parameter not specified for "pagedData" Mongo Handlr', false);
                    return;
                }
                if (!args.paging.pageSize) {
                    callback('"pageSize" parameter not specified for "pagedData" Mongo Handlr', false);
                    return;
                }
                args.paging.pageNo = parseInt(args.paging.pageNo, 10);
                args.paging.pageSize = parseInt(args.paging.pageSize, 10);
                var doPageStatistics = function (res, success) {
                    var data = res.data;
                    col.find(args.filter).count(function (err, res) {
                        var itemCount = res;
                        var mod = itemCount % args.paging.pageSize > 0 ? 1 : 0;
                        callback({
                            pageNo: args.paging.pageNo,
                            pageSize: args.paging.pageSize,
                            pageCount: Math.ceil(itemCount / args.paging.pageSize),
                            itemCount: itemCount,
                            data: data
                        }, true);
                    });
                }
                evalResultSet(col
                    .find(args.filter, args.data)
                    .sort(args.sort ? args.sort : {})
                    .skip((args.paging.pageNo - 1) * args.paging.pageSize)
                    .limit(args.paging.pageSize), 
                    doPageStatistics
                );
            }
            var doInsertOne = function () {
                delete args.data._id;
                delete args.data._created;
                var data = { _id: ctx.objectId(), _created: new Date() };
                for (var key in args.data) {
                    data[key] = args.data[key];
                }
                col.insertOne(data, function (err, res) {
                    callback({ mongo: res, data: data }, true);
                });
            }
            var doInsertMany = function () {
                if (args.data && !args.data.length) {
                    callback('"data" parameter must be an array for "insertMany" Mongo Handlr', false);
                    return;
                }
                args.data.forEach(function (d, i, data) {
                    var newD = {
                        _id: ctx.objectId(),
                        _created: new Date()
                    };
                    for (var key in d) {
                        newD[key] = d[key];
                    }
                    d = newD;
                });
                col.insertMany(args.data, function (err, res) {
                    callback({ mongo: res, data: args.data }, true);
                });
            }
            var doUpdateOne = function () {
                var originalData = args.data ? {
                    _id: args.data._id,
                    _created: args.data._created
                } : null;
                delete args.data._id;
                delete args.data._created;
                delete args.data._modified;
                args.data = { $set: args.data, $currentDate: { '_modified': true } };
                col.updateOne(args.filter, args.data, function (err, res) {
                    if (args.data.$set && originalData && originalData._id)
                        args.data.$set._id = originalData._id;
                    if (args.data.$set && originalData && originalData._created)
                        args.data.$set._created = originalData._created;
                    callback({ mongo: res, data: args.data.$set }, true);
                });
            }
            var doUpdateMany = function () {
                args.data = { $set: args.data, $currentDate: { '_modified': true } };
                col.updateMany(args.filter, args.data, function (err, res) {
                    callback({ mongo: res, data: args.data }, true);
                });
            }
            var doDeleteOne = function () {
                col.deleteOne(args.filter, function (err, res) {
                    callback({ mongo: res }, true);
                });
            }
            var doDeleteMany = function () {
                col.deleteMany(args.filter, function (err, res) {
                    callback({ mongo: res }, true);
                });
            }
            var doReplaceOne = function () {
                col.replaceOne(args.filter, args.data, function (err, res) {
                    callback({ mongo: res, data: args.data }, true);
                });
            }
            var doAggregate = function () {
                var agg = [];
                if (args.pipeline) {
                    args.pipeline.forEach(function (p) {
                        var operator = '$';
                        var value = null;
                        for (var o in p) {
                            operator += (o === 'filter' ? 'match' : o);
                            value = p[o];
                        }
                        if (operator && value) {
                            var obj = {};
                            obj[operator] = value;
                            agg.push(obj);
                        }
                    });
                } else {
                    if (args.filter)
                        agg.push({ $match: args.filter });
                    if (args.project)
                        agg.push({ $project: args.project });
                    if (args.group)
                        agg.push({ $group: args.group });
                    if (args.sort)
                        agg.push({ $sort: args.sort });
                }
                var results = col.aggregate(agg, {
                    allowDiskUsage: true, 
                    cursor: { batchSize: 1000 }
                });
                var objs = [];
                results.on('data', function (data) {
                    objs.push(data);
                });
                results.on('end', function () {
                    callback(objs, true);
                });
            }
            var doDistinct = function () {
                col.distinct(args.data, args.filter, function (err, res) {
                    callback({ data: res }, true);
                });
            }
            switch (args.operation) {
                case 'find': doFind(); break;
                case 'insertOne': doInsertOne(); break;
                case 'insertMany': doInsertMany(); break;
                case 'updateOne': doUpdateOne(); break;
                case 'updateMany': doUpdateMany(); break;
                case 'deleteOne': doDeleteOne(); break;
                case 'deleteMany': doDeleteMany(); break;
                case 'replaceOne': doReplaceOne(); break;
                case 'pagedData': doPagedData(); break;
                case 'aggregate': doAggregate(); break;
                case 'distinct': doDistinct(); break;
                default: callback('Invalid operation specified for Mongo Handlr', false);
            }
        }
        client.connect(args.url, function (err, db) {
            execute(db, function (res, success) {
                db.close();
                if (!success) {
                    console.log('[H:e' + moment().format('YYYY-MM-DDTHH:mm:ss:SSS') + '] ' + res);
                    throw res;
                }
                if (args.callback)
                    args.callback(res);
            });
        });
    }
    this.operations = {
        insertOne: 'insertOne',
        insertMany: 'insertMany',
        updateOne: 'updateOne',
        updateMany: 'updateMany',
        deleteOne: 'deleteOne',
        deleteMany: 'deleteMany',
        replaceOne: 'replaceOne',
        pagedData: 'pagedData',
        aggregate: 'aggregate',
        distinct: 'distinct',
        find: 'find'
    }
}