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
    if (this.cache)
      memcached = new Memcached(cache.server, cache.port);
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
   * @param {function(Object):void} callback - A function to execute once the document has been retrieved.
   */
  findOne(args, callback) {
    if (!callback)
      return;
    if (!args || !args.filter) {
      callback(null);
      return;
    }
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
        callback: (res) => {
          let d = res.data && res.data.length ? res.data[0] : null;
          if (this.cache) {
            memcached.set(key, d, cache.lifetime, (err) => {
              if (err) { console.log('>>> MEMCACHED ERROR <<<'); console.log(err); }
              callback(d);
            });
          }
          else
            callback(d);
        }
      });
    };
    if (this.cache) {
      memcached.get(key, (err, cache) => {
        if (!cache) {
          m();
          return;
        }
        callback(cache);
      });
    }
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
   * @param {function(Object):void} callback - A function to execute once the documents have been retrieved.
   */
  findMany(args, callback) {
    if (!callback)
      return;
    if (!args) {
      callback(null);
      return;
    }
    db.mongo({
      url: this.url,
      collection: this.collection,
      operation: db.operations.find,
      data: args.data,
      filter: args.filter,
      sort: args.sort,
      limit: args.limit,
      callback: (res) => {
        callback(res.data);
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
   * @param {function(Object):void} callback - A function to execute once the paged documents have been retrieved.
   */
  page(args, callback) {
    if (!callback)
      return;
    if (!args || !args.pageNo || !args.pageSize) {
      callback(null);
      return;
    }
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
      callback: (res) => {
        callback(res);
      }
    });
  }

  /**
   * Insert a document into the bound collection.
   * @param {Object} args - The arguments detailing the insert operation.
   * @param {Object} args.data - The document to insert into the collection.
   * @param {function(Object):void} [callback] - A function to execute once the document has been inserted.
   */
  create(args, callback) {
    if (!args || !args.data) {
      if (callback) callback(null);
      return;
    }
    db.mongo({
      url: this.url,
      collection: this.collection,
      operation: db.operations.insertOne,
      data: args.data,
      callback: (res) => {
        let key = this.collection + '-' + res.data._id;
        if (this.cache) {
          memcached.set(key, res.data, cache.lifetime, (err) => {
            if (err) { console.log('>>> MEMCACHED ERROR <<<'); console.log(err); }
            if (callback) callback(res.data);
          });
          return;
        }
        if (callback) callback(res.data);
      }
    });
  }

  /**
   * Insert many documents into the bound collection.
   * @param {Object} args - The arguments detailing the insert operation.
   * @param {Object[]} args.data - The documents to insert into the collection.
   * @param {function(Object):void} [callback] - A function to execute once the document has been inserted.
   */
  createMany(args, callback) {
    if (!args || !args.data || !args.data.length) {
      if (callback) callback(null);
      return;
    }
    db.mongo({
      url: this.url,
      collection: this.collection,
      operation: db.operations.insertMany,
      data: args.data,
      callback: (res) => {
        if (callback) callback(res.data);
      }
    });
  }

  /**
   * Updates documents in the bound collection.
   * @param {Object} args - The arguments detailing the update operation.
   * @param {Object} args.data - The properties to update each matched document in the collection.
   * @param {Object} args.filter - The filter to apply to the update operation.
   * @param {function(Object):void} [callback] - A function to execute once the documents have been updated.
   */
  update(args, callback) {
    if (!args || !args.filter || !args.data) {
      if (callback) callback(null);
      return;
    }
    let filter = args.filter;
    let obj = args.data;
    db.mongo({
      url: this.url,
      collection: this.collection,
      operation: db.operations.updateOne,
      filter: typeof filter === 'object' ? filter : { _id: db.objectId(filter) },
      data: obj,
      callback: (res) => {
        obj = res.data;
        let key = this.collection + '-' + obj._id;
        if (this.cache) {
          memcached.get(key, (err, cache) => {
            if (!cache) {
              memcached.set(key, obj, cache.lifetime, (err) => {
                if (err) { console.log('>>> MEMCACHED ERROR <<<'); console.log(err); }
                if (callback) callback(res.data);
              });
              return;
            }
            memcached.replace(key, obj, cache.lifetime, (err) => {
              if (err) { console.log('>>> MEMCACHED ERROR <<<'); console.log(err); }
              if (callback) callback(res.data);
            });
          });
          return;
        }
        if (callback) callback(obj);
      }
    });
  }

  /**
   * Deletes a document from the bound collection.
   * @param {Object} args - The arguments detailing the delete operation.
   * @param {Object} args.filter - The filter to apply to the delete operation.
   * @param {function(Object):void} [callback] - A function to execute once the document has been deleted.
   */
  delete(args, callback) {
    if (!args || !args.filter) {
      if (callback) callback(null);
      return;
    }
    let filter = args.filter;
    filter = typeof filter === 'object' ? filter : { _id: db.objectId(filter) };
    db.mongo({
      url: this.url,
      collection: this.collection,
      operation: db.operations.deleteOne,
      filter: filter,
      callback: (res) => {
        let key = this.collection + '-' + filter._id;
        if (this.cache) {
          memcached.del(key, (err) => {
            if (err) { console.log('>>> MEMCACHED ERROR <<<'); console.log(err); }
            if (callback) callback(res.data);
          });
          return;
        }
        if (callback) callback(res);
      }
    });
  }

  /**
   * Delete many documents from the bound collection.
   * @param {Object} args - The arguments detailing the delete operation.
   * @param {Object} args.filter - The filter to apply to the delete operation.
   * @param {function(Object):void} [callback] - A function to execute once the documents have been deleted.
   */
  deleteMany(args, callback) {
    if (!args || !args.filter) {
      if (callback) callback(null);
      return;
    }
    let filter = args.filter;
    filter = typeof filter === 'object' ? filter : { _id: db.objectId(filter) };
    db.mongo({
      url: this.url,
      collection: this.collection,
      operation: db.operations.deleteMany,
      filter: filter,
      callback: (res) => {
        if (callback) callback(res);
      }
    });
  }
}