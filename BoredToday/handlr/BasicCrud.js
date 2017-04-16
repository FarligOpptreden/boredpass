import db from './Mongo';

export default class BasicCrud {
    constructor(url, collection) {
        this.url = url;
        this.collection = collection;
    }
    findOne(filter, callback) {
        if (!filter) {
            callback(null);
            return;
        }
        db.mongo({
            url: this.url,
            collection: this.collection,
            operation: db.operations.find,
            filter: typeof filter === 'object' ? filter : { _id: db.objectId(filter) },
            callback: (res) => {
                callback(res.data && res.data.length ? res.data[0] : null);
            }
        });
    }
    findMany(filter, limit, callback) {
        db.mongo({
            url: this.url,
            collection: this.collection,
            operation: db.operations.find,
            filter: filter,
            limit: limit,
            callback: (res) => {
                callback(res.data);
            }
        });
    }
    page(filter, sort, pageNo, pageSize, callback) {
        db.mongo({
            url: this.url,
            collection: this.collection,
            operation: db.operations.pagedData,
            filter: filter,
            sort: sort,
            paging: {
                pageNo: pageNo,
                pageSize: pageSize
            },
            callback: (res) => {
                callback(res);
            }
        });
    }
    create(obj, callback) {
        db.mongo({
            url: this.url,
            collection: this.collection,
            operation: db.operations.insertOne,
            data: obj,
            callback: (res) => {
                callback(res.data);
            }
        });
    }
    update(obj, filter, callback) {
        db.mongo({
            url: this.url,
            collection: this.collection,
            operation: db.operations.updateOne,
            filter: typeof filter === 'object' ? filter : { _id: db.objectId(filter) },
            data: obj,
            callback: (res) => {
                obj = res.data;
                callback(obj);
            }
        });
    }
    delete(filter, callback) {
        db.mongo({
            url: this.url,
            collection: this.collection,
            operation: db.operations.deleteOne,
            filter: typeof filter === 'object' ? filter : { _id: db.objectId(filter) },
            callback: (res) => {
                callback(res);
            }
        });
    }
}