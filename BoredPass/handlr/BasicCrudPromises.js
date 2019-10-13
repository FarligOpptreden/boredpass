import { BasicCrud } from ".";

export default class BasicCrudPromises {
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
    this._BasicCrud = new BasicCrud(url, collection, cache);
  }

  /**
   * Gets the MongoDB connector associated with this bound collection.
   */
  get db() {
    return this._BasicCrud.db;
  }

  /**
   * Construct a new object against the targeted schema.
   */
  schema() {
    return null;
  }

  /**
   * Counts the documents in the bound collection.
   * @param {Object} args - The arguments detailing the count operation.
   * @param {Object} args.filter - The filter to apply to the count operation.
   * @returns {Promise} - A promise object handling the response.
   */
  count(args) {
    return new Promise((resolve, reject) => {
      if (!args || !args.filter)
        return reject("No arguments or filter specified.");

      this._BasicCrud.count(args, (res, err) => {
        if (err) return reject(err);

        resolve(res);
      });
    });
  }

  /**
   * Find a single document in the bound collection.
   * @param {Object} args - The arguments detailing the find operation.
   * @param {Object} args.filter - The filter to apply to the find operation.
   * @param {Object} args.data? - The properties of the document to select.
   * @param {Object} args.sort? - The sort clause(s) to apply to the collection.
   * @returns {Promise} - A promise object handling the response.
   */
  findOne(args) {
    return new Promise((resolve, reject) => {
      if (!args || !args.filter)
        return reject("No arguments or filter specified.");

      this._BasicCrud.findOne(args, (res, err) => {
        if (err) return reject(err);

        resolve(res);
      });
    });
  }

  /**
   * Find numerous documents in the bound collection.
   * @param {Object} [args] - The arguments detailing the find operation.
   * @param {Object} args.data? - The properties of the document to select.
   * @param {Object} args.filter? - The filter to apply to the find operation.
   * @param {Object} args.sort? - The sort clause(s) to apply to the collection.
   * @param {number} args.limit? - The amount of documents to limit in the selection.
   * @returns {Promise} - A promise object handling the response.
   */
  findMany(args) {
    return new Promise((resolve, reject) => {
      if (!args) return reject("No arguments specified.");

      this._BasicCrud.findMany(args, (res, err) => {
        if (err) return reject(err);

        resolve(res);
      });
    });
  }

  /**
   * Find numerous documents in the bound collection based on the supplied aggregation pipeline.
   * @param {Object} [args] - The arguments detailing the find operation.
   * @param {number} args.pipeline? - The aggregation pipeline to apply.
   * @returns {Promise} - A promise object handling the response.
   */
  aggregate(args) {
    return new Promise((resolve, reject) => {
      if (!args) return reject("No arguments specified.");

      this._BasicCrud.aggregate(args, (res, err) => {
        if (err) return reject(err);

        resolve(res);
      });
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
   * @returns {Promise} - A promise object handling the response.
   */
  page(args) {
    return new Promise((resolve, reject) => {
      if (!args) return reject("No arguments specified.");

      if (!args.pageNo) return reject('"args.pageNo" was not specified.');

      if (!args.pageSize) return reject('"args.pageSize" was not specified.');

      this._BasicCrud.page(args, (res, err) => {
        if (err) return reject(err);

        resolve(res);
      });
    });
  }

  /**
   * Insert a document into the bound collection.
   * @param {Object} args - The arguments detailing the insert operation.
   * @param {Object} args.data - The document to insert into the collection.
   * @returns {Promise} - A promise object handling the response.
   */
  create(args) {
    return new Promise((resolve, reject) => {
      if (!args) return reject("No arguments specified.");

      if (!args.data) return reject('"args.data" was not specified.');

      this._BasicCrud.create(args, (res, err) => {
        if (err) return reject(err);

        resolve(res);
      });
    });
  }

  /**
   * Insert many documents into the bound collection.
   * @param {Object} args - The arguments detailing the insert operation.
   * @param {Object[]} args.data - The documents to insert into the collection.
   * @returns {Promise} - A promise object handling the response.
   */
  createMany(args) {
    return new Promise((resolve, reject) => {
      if (!args) return reject("No arguments specified.");

      if (!args.data) return reject('"args.data" was not specified.');

      if (!args.data.length) return reject('"args.data" is an empty array.');

      this._BasicCrud.createMany(args, (res, err) => {
        if (err) return reject(err);

        resolve(res);
      });
    });
  }

  /**
   * Updates a document in the bound collection.
   * @param {Object} args - The arguments detailing the update operation.
   * @param {Object} args.data - The properties to update each matched document in the collection.
   * @param {Object} args.filter - The filter to apply to the update operation.
   * @returns {Promise} - A promise object handling the response.
   */
  update(args) {
    return new Promise((resolve, reject) => {
      if (!args) return reject("No arguments specified.");

      if (!args.data) return reject('"args.data" was not specified.');

      if (!args.filter) return reject('"args.filter" was not specified.');

      this._BasicCrud.update(args, (res, err) => {
        if (err) return reject(err);

        resolve(res);
      });
    });
  }

  /**
   * Updates multiple documents in the bound collection.
   * @param {Object} args - The arguments detailing the update operation.
   * @param {Object} args.data - The properties to update each matched document in the collection.
   * @param {Object} args.filter - The filter to apply to the update operation.
   * @returns {Promise} - A promise object handling the response.
   */
  updateMany(args) {
    return new Promise((resolve, reject) => {
      if (!args) return reject("No arguments specified.");

      if (!args.data) return reject('"args.data" was not specified.');

      if (!args.filter) return reject('"args.filter" was not specified.');

      this._BasicCrud.updateMany(args, (res, err) => {
        if (err) return reject(err);

        resolve(res);
      });
    });
  }

  /**
   * Deletes a document from the bound collection.
   * @param {Object} args - The arguments detailing the delete operation.
   * @param {Object} args.filter - The filter to apply to the delete operation.
   * @returns {Promise} - A promise object handling the response.
   */
  delete(args) {
    return new Promise((resolve, reject) => {
      if (!args) return reject("No arguments specified.");

      if (!args.filter) return reject('"args.filter" was not specified.');

      this._BasicCrud.delete(args, (res, err) => {
        if (err) return reject(err);

        resolve(res);
      });
    });
  }

  /**
   * Delete many documents from the bound collection.
   * @param {Object} args - The arguments detailing the delete operation.
   * @param {Object} args.filter - The filter to apply to the delete operation.
   * @returns {Promise} - A promise object handling the response.
   */
  deleteMany(args) {
    return new Promise((resolve, reject) => {
      if (!args) return reject("No arguments specified.");

      if (!args.filter) return reject('"args.filter" was not specified.');

      this._BasicCrud.deleteMany(args, (res, err) => {
        if (err) return reject(err);

        resolve(res);
      });
    });
  }
}
