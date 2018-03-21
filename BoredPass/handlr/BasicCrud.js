import db from './Mongo';
import Memcached from 'memcached';

let memcached = null;

export default class BasicCrud {

  /**
   * Constructs a BasicCrud object.
   * @param {string} url - The connection string to the MongoDB data source.
   * @param {string} collection - The name of the collection to bind to.
   * @param {cache} [cache] - Arguments representing caching using Memcached.
   * @property {string} cache.server - The server where Memcached is located.
   * @property {string} cache.port - The port on which Memcached is listening.
   * @property {number} cache.lifetime - The amount of time (in seconds) that a record is cached in Memcached.
   */
  constructor(url, collection, cache) {
    this.url = url;
    this.collection = collection;
    this.cache = cache ? true : false;

    if (this.cache) {
      this.mcache = cache;
      memcached = new Memcached(cache.server, cache.port);
    }
  }

  /**
   * Gets the MongoDB connector associated with this bound collection.
   */
  get db() {
    return db;
  }

  /**
   * Find a single document in the bound collection.
   * @param {Object} args - The arguments detailing the find operation.
   * @param {Object} args.filter - The filter to apply to the find operation.
   * @param {Object} args.data? - The properties of the document to select.
   * @param {Object} args.sort? - The sort clause(s) to apply to the collection.
   * @param {function(Object, Object):void} callback - A function to execute once the document has been retrieved.
   */
  findOne(args, callback) {
    if (!callback)
      return;

    if (!args || !args.filter)
      return callback(null);

    let mcache = this.cache;
    let filter = args.filter;
    filter = typeof filter === 'object' ? filter : { _id: db.objectId(filter) };
    let key = this.collection + '-' + filter._id;

    let m = () => {
      db.mongo({
        url: this.url,
        collection: this.collection,
        operation: db.operations.find,
        data: args.data,
        filter: filter,
        sort: args.sort,
        limit: 1,
        callback: (res, err) => {
          if (err)
            return callback(null, err);

          let d = res && res.data && res.data.length ? res.data[0] : null;
          if (mcache) {
            memcached.set(key, d, this.mcache.lifetime, (err) => {
              if (err) { console.log('>>> MEMCACHED ERROR <<<'); console.log(err); }
              callback(d);
            });
          }
          else
            callback(d);
        }
      });
    };
    if (mcache)
      memcached.get(key, (err, cache) => {
        if (!cache) {
          m();
          return;
        }
        callback(cache);
      });
    else
      m();
  }

  /**
   * Find numerous documents in the bound collection.
   * @param {Object} [args] - The arguments detailing the find operation.
   * @param {Object} args.data? - The properties of the document to select.
   * @param {Object} args.filter? - The filter to apply to the find operation.
   * @param {Object} args.sort? - The sort clause(s) to apply to the collection.
   * @param {number} args.limit? - The amount of documents to limit in the selection.
   * @param {function(Object, Object):void} callback - A function to execute once the documents have been retrieved.
   */
  findMany(args, callback) {
    if (!callback)
      return;

    if (!args)
      return callback(null);

    db.mongo({
      url: this.url,
      collection: this.collection,
      operation: db.operations.find,
      data: args.data,
      filter: args.filter,
      sort: args.sort,
      limit: args.limit,
      callback: (res, err) => {
        if (err)
          return callback(null, err);

        callback((res && res.data) || null);
      }
    });
  }

  /**
   * Find numerous documents in the bound collection based on the supplied aggregation pipeline.
   * @param {Object} [args] - The arguments detailing the find operation.
   * @param {number} args.pipeline? - The aggregation pipeline to apply.
   * @param {function(Object, Object):void} callback - A function to execute once the documents have been retrieved.
   */
  aggregate(args, callback) {
    if (!callback)
      return;

    if (!args)
      return callback(null);

    db.mongo({
      url: this.url,
      collection: this.collection,
      operation: db.operations.aggregate,
      pipeline: args.pipeline,
      callback: (res, err) => {
        if (err)
          return callback(null, err);

        callback(res || null);
      }
    });
  }

  /**
   * Find documents in the bound collection based on the supplied paging parameters.
   * @param {Object} args - The arguments detailing the paging operation.
   * @param {number} args.pageNo - The page number to retrieve.
   * @param {number} args.pageSize - The number of documents in a page.
   * @param {Object} args.data? - The properties of the document to select.
   * @param {Object} args.filter? - The filter to apply to the find operation.
   * @param {Object} args.sort? - The sort clause(s) to apply to the collection.
   * @param {function(Object, Object):void} callback - A function to execute once the paged documents have been retrieved.
   */
  page(args, callback) {
    if (!callback)
      return;

    if (!args || !args.pageNo || !args.pageSize)
      return callback(null);

    db.mongo({
      url: this.url,
      collection: this.collection,
      operation: db.operations.pagedData,
      data: args.data,
      filter: args.filter,
      sort: args.sort,
      paging: {
        pageNo: args.pageNo,
        pageSize: args.pageSize
      },
      callback: (res, err) => {
        if (err)
          return callback(null, err);

        callback(res, err);
      }
    });
  }

  /**
   * Insert a document into the bound collection.
   * @param {Object} args - The arguments detailing the insert operation.
   * @param {Object} args.data - The document to insert into the collection.
   * @param {function(Object, Object):void} [callback] - A function to execute once the document has been inserted.
   */
  create(args, callback) {
    if (!args || !args.data)
      return callback && callback(null);

    let mcache = this.cache;

    db.mongo({
      url: this.url,
      collection: this.collection,
      operation: db.operations.insertOne,
      data: args.data,
      callback: (res, err) => {
        if (!res || err) {
          callback(null, err);
          return;
        }
        let key = this.collection + '-' + res.data._id;
        if (mcache)
          return memcached.set(key, res.data, this.mcache.lifetime, (err) => {
            if (err) { console.log('>>> MEMCACHED ERROR <<<'); console.log(err); }
            callback && callback(res.data);
          });

        callback && callback(res.data);
      }
    });
  }

  /**
   * Insert many documents into the bound collection.
   * @param {Object} args - The arguments detailing the insert operation.
   * @param {Object[]} args.data - The documents to insert into the collection.
   * @param {function(Object, Object):void} [callback] - A function to execute once the document has been inserted.
   */
  createMany(args, callback) {
    if (!args || !args.data || !args.data.length)
      return callback && callback(null);

    db.mongo({
      url: this.url,
      collection: this.collection,
      operation: db.operations.insertMany,
      data: args.data,
      callback: (res, err) => {
        if (err)
          return callback(null, err);

        callback && callback(res && res.data);
      }
    });
  }

  /**
   * Updates a document in the bound collection.
   * @param {Object} args - The arguments detailing the update operation.
   * @param {Object} args.data - The properties to update each matched document in the collection.
   * @param {Object} args.filter - The filter to apply to the update operation.
   * @param {function(Object, Object):void} [callback] - A function to execute once the documents have been updated.
   */
  update(args, callback) {
    if (!args || !args.filter || !args.data)
      return callback && callback(null);

    let filter = args.filter;
    let mcache = this.cache;
    let obj = args.data;

    db.mongo({
      url: this.url,
      collection: this.collection,
      operation: db.operations.updateOne,
      filter: typeof filter === 'object' ? filter : { _id: db.objectId(filter) },
      data: obj,
      callback: (res, err) => {
        if (err)
          return callback(null, err);

        if (!res)
          return callback(null);

        obj = res.data;
        let key = this.collection + '-' + obj._id;

        if (mcache)
          return memcached.get(key, (err, cache) => {
            if (!cache)
              return memcached.set(key, obj, this.mcache.lifetime, (err) => {
                if (err) { console.log('>>> MEMCACHED ERROR <<<'); console.log(err); }
                callback && callback(res.data);
              });

            memcached.replace(key, obj, this.mcache.lifetime, (err) => {
              if (err) { console.log('>>> MEMCACHED ERROR <<<'); console.log(err); }
              callback && callback(res.data);
            });
          });

        callback && callback(obj);
      }
    });
  }

  /**
   * Updates multiple documents in the bound collection.
   * @param {Object} args - The arguments detailing the update operation.
   * @param {Object} args.data - The properties to update each matched document in the collection.
   * @param {Object} args.filter - The filter to apply to the update operation.
   * @param {function(Object, Object):void} [callback] - A function to execute once the documents have been updated.
   */
  updateMany(args, callback) {
    if (!args || !args.filter || !args.data)
      return callback && callback(null);

    let filter = args.filter;
    let mcache = this.cache;
    let obj = args.data;

    db.mongo({
      url: this.url,
      collection: this.collection,
      operation: db.operations.updateMany,
      filter: typeof filter === 'object' ? filter : { _id: db.objectId(filter) },
      data: obj,
      callback: (res, err) => {
        if (err)
          return callback(null, err);

        if (!res)
          return callback(null);

        obj = res.data;
        callback && callback(obj);
      }
    });
  }

  /**
   * Deletes a document from the bound collection.
   * @param {Object} args - The arguments detailing the delete operation.
   * @param {Object} args.filter - The filter to apply to the delete operation.
   * @param {function(Object, Object):void} [callback] - A function to execute once the document has been deleted.
   */
  delete(args, callback) {
    if (!args || !args.filter)
      return callback && callback(null);

    let filter = args.filter;
    let mcache = this.cache;
    filter = typeof filter === 'object' ? filter : { _id: db.objectId(filter) };

    db.mongo({
      url: this.url,
      collection: this.collection,
      operation: db.operations.deleteOne,
      filter: filter,
      callback: (res, err) => {
        if (err)
          return callback && callback(null, err);

        let key = this.collection + '-' + filter._id;
        if (mcache)
          return memcached.del(key, (err) => {
            if (err) { console.log('>>> MEMCACHED ERROR <<<'); console.log(err); }
            callback && callback(res.data);
          });

        callback && callback(res);
      }
    });
  }

  /**
   * Delete many documents from the bound collection.
   * @param {Object} args - The arguments detailing the delete operation.
   * @param {Object} args.filter - The filter to apply to the delete operation.
   * @param {function(Object, Object):void} [callback] - A function to execute once the documents have been deleted.
   */
  deleteMany(args, callback) {
    if (!args || !args.filter)
      return callback && callback(null);

    let filter = args.filter;
    filter = typeof filter === 'object' ? filter : { _id: db.objectId(filter) };

    db.mongo({
      url: this.url,
      collection: this.collection,
      operation: db.operations.deleteMany,
      filter: filter,
      callback: (res, err) => {
        if (err)
          return callback && callback(null, err);

        callback && callback(res);
      }
    });
  }
}