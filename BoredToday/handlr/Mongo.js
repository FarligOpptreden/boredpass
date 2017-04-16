import mongo from 'mongodb';
import moment from 'moment';

class Mongo {
    get operations() {
        return {
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
        };
    }
    objectId(args) {
        return new mongo.ObjectID(args);
    }
    mongo(args) {
        let client = mongo.MongoClient;
        if (args.data)
            for (let k in args.data) {
                if (k === '_id' && mongo.ObjectID.isValid(args.data[k]))
                    args.data[k] = this.objectId(args.data[k]);
            }
        if (args.filter)
            for (let k in args.filter) {
                if (k === '_id' && mongo.ObjectID.isValid(args.filter[k]))
                    args.filter[k] = this.objectId(args.filter[k]);
            }
        let toLog = '';
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
        let execute = (db, callback) => {
            let operation = args.operation;
            if (operation === this.operations.pagedData)
                operation = this.operations.find;
            let col = db.collection(args.collection);
            let evalResultSet = (cursor, callback) => {
                let objs = [];
                cursor.each((err, res) => {
                    if (res != null)
                        objs.push(res);
                    else
                        callback({ data: objs }, true);
                });
            }
            let doFind = () => {
                let results = col.find(args.filter, args.data);
                if (args.sort)
                    results = results.sort(args.sort);
                if (args.skip)
                    results = results.skip(args.skip);
                if (args.limit)
                    results = results.limit(args.limit);
                evalResultSet(results, callback);
            }
            let doPagedData = () => {
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
                let doPageStatistics = (res, success) => {
                    let data = res.data;
                    col.find(args.filter).count((err, res) => {
                        let itemCount = res;
                        let mod = itemCount % args.paging.pageSize > 0 ? 1 : 0;
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
            let doInsertOne = () => {
                delete args.data._id;
                delete args.data._created;
                let data = { _id: this.objectId(), _created: new Date() };
                for (let key in args.data) {
                    data[key] = args.data[key];
                }
                col.insertOne(data, (err, res) => {
                    callback({ mongo: res, data: data }, true);
                });
            }
            let doInsertMany = () => {
                if (args.data && !args.data.length) {
                    callback('"data" parameter must be an array for "insertMany" Mongo Handlr', false);
                    return;
                }
                args.data.forEach((d, i, data) => {
                    let newD = {
                        _id: this.objectId(),
                        _created: new Date()
                    };
                    for (let key in d) {
                        newD[key] = d[key];
                    }
                    d = newD;
                });
                col.insertMany(args.data, (err, res) => {
                    callback({ mongo: res, data: args.data }, true);
                });
            }
            let doUpdateOne = () => {
                let originalData = args.data ? {
                    _id: args.data._id,
                    _created: args.data._created
                } : null;
                delete args.data._id;
                delete args.data._created;
                delete args.data._modified;
                args.data = { $set: args.data, $currentDate: { '_modified': true } };
                col.updateOne(args.filter, args.data, (err, res) => {
                    if (args.data.$set && originalData && originalData._id)
                        args.data.$set._id = originalData._id;
                    if (args.data.$set && originalData && originalData._created)
                        args.data.$set._created = originalData._created;
                    callback({ mongo: res, data: args.data.$set }, true);
                });
            }
            let doUpdateMany = () => {
                args.data = { $set: args.data, $currentDate: { '_modified': true } };
                col.updateMany(args.filter, args.data, (err, res) => {
                    callback({ mongo: res, data: args.data }, true);
                });
            }
            let doDeleteOne = () => {
                col.deleteOne(args.filter, (err, res) => {
                    callback({ mongo: res }, true);
                });
            }
            let doDeleteMany = () => {
                col.deleteMany(args.filter, (err, res) => {
                    callback({ mongo: res }, true);
                });
            }
            let doReplaceOne = () => {
                col.replaceOne(args.filter, args.data, (err, res) => {
                    callback({ mongo: res, data: args.data }, true);
                });
            }
            let doAggregate = () => {
                let agg = [];
                if (args.pipeline) {
                    args.pipeline.forEach((p) => {
                        let operator = '$';
                        let value = null;
                        for (let o in p) {
                            operator += (o === 'filter' ? 'match' : o);
                            value = p[o];
                        }
                        if (operator && value) {
                            let obj = {};
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
                let results = col.aggregate(agg, {
                    allowDiskUsage: true,
                    cursor: { batchSize: 1000 }
                });
                let objs = [];
                results.on('data', (data) => {
                    objs.push(data);
                });
                results.on('end', () => {
                    callback(objs, true);
                });
            }
            let doDistinct = () => {
                col.distinct(args.data, args.filter, (err, res) => {
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
        client.connect(args.url, (err, db) => {
            execute(db, (res, success) => {
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
}

export default new Mongo();