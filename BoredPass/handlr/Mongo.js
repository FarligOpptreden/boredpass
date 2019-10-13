import mongo from "mongodb";
import { konsole, CliColors } from ".";
import { setTimeout } from "timers";

const connections = [];

class Mongo {
  /**
   * Gets the allowed operations against the MongoDB data source.
   */
  get operations() {
    return {
      insertOne: "insertOne",
      insertMany: "insertMany",
      updateOne: "updateOne",
      updateMany: "updateMany",
      deleteOne: "deleteOne",
      deleteMany: "deleteMany",
      replaceOne: "replaceOne",
      pagedData: "pagedData",
      aggregate: "aggregate",
      distinct: "distinct",
      find: "find",
      count: "count"
    };
  }

  /**
   * Create a MongoDB ObjectID from the supplied value. If no value is supplied, a new ObjectID is generated.
   * @param {string|Object|undefined} [value] - The value to convert to an ObjectID.
   */
  objectId(value) {
    if (typeof value === "string") return new mongo.ObjectID(value);
    return value;
  }

  /**
   * Executes a MongoDB statement against the MongoDB data source.
   * @param {Object} args - The arguments representing the operation to perform.
   * @param {string} args.url - The location of the MongoDB data source, typically in the format mongodb://server:port.
   * @param {string} args.collection - The collection that is target of the operation being performed.
   * @param {string} args.operation - The operation to perform against the target collection. Use the .operations helper on the exported module for a list of supported operations.
   * @param {Object} args.data? - The properties to select using a 'find' operation, or the data to create or modify using 'insert' or 'update' operations.
   * @param {Object} args.filter? - The filter to apply to the operation.
   * @param {Object} args.sort? - The sorting to apply to the documents being selected during a 'find' operation.
   * @param {Object} args.limit? - The amount of documents to limit the results of a 'find' operation to.
   * @param {Object} args.skip? - The amount of documents to skip during a 'find' operation.
   * @param {Object} args.paging? - The paging parameters to use when performing a 'pagedData' operation.
   * @param {Object} args.paging.pageNo - The page number to retrieve during a 'pagedData' operation.
   * @param {Object} args.paging.pageSize - The number of documents in a paged set when performing a 'pagedData' operation.
   * @param {Object[]} args.pipeline? - The aggregation pipeline to apply during an 'aggregate' operation.
   * @param {function(Object):void} args.callback - The function to call when the operation has been completed.
   * @param {Object} [config] - A configuration object defining the debug logging.
   */
  mongo(args, config) {
    if (!args || !args.collection) {
      konsole.error(`Error calling mongo. Args or collection not set.`);

      if (args && args.callback) args.callback(null);

      return;
    }

    let startTime = new Date().getTime();
    let client = mongo.MongoClient;

    if (args.data)
      for (let k in args.data) {
        if (
          k === "_id" &&
          mongo.ObjectID.isValid(args.data[k]) &&
          this.objectId(args.data[k]).toString() === args.data[k]
        )
          args.data[k] = this.objectId(args.data[k]);
      }

    if (args.filter)
      for (let k in args.filter) {
        if (
          k === "_id" &&
          mongo.ObjectID.isValid(args.filter[k]) &&
          this.objectId(args.filter[k]).toString() === args.filter[k]
        )
          args.filter[k] = this.objectId(args.filter[k]);
      }

    let toLog = "";
    toLog += `${CliColors.FgGreen}START > ${CliColors.Reset}${args.collection}.${args.operation} on ${args.url}`;

    if (config && config.loggingLevel && config.loggingLevel.mongo > 1) {
      toLog += "\n    > Filter     : " + JSON.stringify(args.filter);
      toLog += "\n    > Data       : " + JSON.stringify(args.data);
      toLog += "\n    > Sort       : " + JSON.stringify(args.sort);
      toLog += "\n    > Project    : " + JSON.stringify(args.project);
      toLog += "\n    > Group      : " + JSON.stringify(args.group);
      toLog += "\n    > Skip       : " + JSON.stringify(args.skip);
      toLog += "\n    > Limit      : " + JSON.stringify(args.limit);
      toLog += "\n    > Pipeline   : " + JSON.stringify(args.pipeline);
    }

    konsole.log(toLog, `h${CliColors.BgGreen}${CliColors.FgWhite}.mngo`);
    let execute = (db, callback) => {
      let operation = args.operation;

      if (operation === this.operations.pagedData)
        operation = this.operations.find;

      let col = db.collection(args.collection);
      let evalResultSet = (cursor, callback) => {
        let objs = [];
        cursor.each((err, res) => {
          if (res != null) objs.push(res);
          else callback({ data: objs }, true);
        });
      };
      let doCount = () => {
        col.find(args.filter).count((err, res) => {
          if (err) {
            callback(err, false);
            return;
          }

          let itemCount = res;
          callback(itemCount, true);
        });
      };
      let doFind = () => {
        let results = col.find(args.filter, args.data);

        if (args.sort) results = results.sort(args.sort);

        if (args.skip) results = results.skip(args.skip);

        if (args.limit) results = results.limit(args.limit);

        evalResultSet(results, callback);
      };
      let doPagedData = () => {
        if (!args.paging) {
          callback(
            'Paging parameters not specified for "pagedData" Mongo Handlr',
            false
          );
          return;
        }

        if (!args.paging.pageNo) {
          callback(
            '"pageNo" parameter not specified for "pagedData" Mongo Handlr',
            false
          );
          return;
        }

        if (!args.paging.pageSize) {
          callback(
            '"pageSize" parameter not specified for "pagedData" Mongo Handlr',
            false
          );
          return;
        }

        args.paging.pageNo = parseInt(args.paging.pageNo, 10);
        args.paging.pageSize = parseInt(args.paging.pageSize, 10);
        let doPageStatistics = (res, success) => {
          let data = res.data;
          col.find(args.filter).count((err, res) => {
            if (err) {
              callback(err, false);
              return;
            }

            let itemCount = res;
            let mod = itemCount % args.paging.pageSize > 0 ? 1 : 0;
            callback(
              {
                pageNo: args.paging.pageNo,
                pageSize: args.paging.pageSize,
                pageCount: Math.ceil(itemCount / args.paging.pageSize),
                itemCount: itemCount,
                data: data
              },
              true
            );
          });
        };
        evalResultSet(
          col
            .find(args.filter, args.data)
            .sort(args.sort ? args.sort : {})
            .skip((args.paging.pageNo - 1) * args.paging.pageSize)
            .limit(args.paging.pageSize),
          doPageStatistics
        );
      };
      let doInsertOne = () => {
        delete args.data._id;
        delete args.data._created;
        let data = { _id: this.objectId(), _created: new Date() };

        for (let key in args.data) {
          data[key] = args.data[key];
        }

        col.insertOne(data, (err, res) => {
          if (err) {
            callback(err, false);
            return;
          }

          callback({ mongo: res, data: data }, true);
        });
      };
      let doInsertMany = () => {
        if (args.data && !args.data.length) {
          callback(
            '"data" parameter must be an array for "insertMany" Mongo Handlr',
            false
          );
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
          if (err) {
            callback(err, false);
            return;
          }

          callback({ mongo: res, data: args.data }, true);
        });
      };
      let doUpdateOne = () => {
        let originalData = args.data
          ? {
              _id: args.data._id,
              _created: args.data._created
            }
          : null;
        delete args.data._id;
        delete args.data._created;
        delete args.data._modified;
        args.data = { $set: args.data, $currentDate: { _modified: true } };

        if (args.data.$set.$addToSet) {
          args.data.$addToSet = args.data.$set.$addToSet;
          delete args.data.$set.$addToSet;
        }

        if (args.data.$set.$push) {
          args.data.$push = args.data.$set.$push;
          delete args.data.$set.$push;
        }

        if (args.data.$set.$pull) {
          args.data.$pull = args.data.$set.$pull;
          delete args.data.$set.$pull;
        }

        if (args.data.$set.$pullAll) {
          args.data.$pullAll = args.data.$set.$pullAll;
          delete args.data.$set.$pullAll;
        }

        if (!args.data.$set || Object.keys(args.data.$set).length === 0)
          delete args.data.$set;

        col.updateOne(args.filter, args.data, (err, res) => {
          if (err) {
            callback(err, false);
            return;
          }

          if (args.data.$set && originalData && originalData._id)
            args.data.$set._id = originalData._id;

          if (args.data.$set && originalData && originalData._created)
            args.data.$set._created = originalData._created;

          let response;

          if (args.data.$set) response = args.data.$set;

          if (args.data.$addToSet) response = args.data.$addToSet;

          if (args.data.$push) response = args.data.$push;

          callback({ mongo: res, data: response }, true);
        });
      };
      let doUpdateMany = () => {
        args.data = { $set: args.data, $currentDate: { _modified: true } };
        col.updateMany(args.filter, args.data, (err, res) => {
          if (err) {
            callback(err, false);
            return;
          }

          callback({ mongo: res, data: args.data }, true);
        });
      };
      let doDeleteOne = () => {
        col.deleteOne(args.filter, (err, res) => {
          if (err) {
            callback(err, false);
            return;
          }

          callback({ mongo: res }, true);
        });
      };
      let doDeleteMany = () => {
        col.deleteMany(args.filter, (err, res) => {
          if (err) {
            callback(err, false);
            return;
          }

          callback({ mongo: res }, true);
        });
      };
      let doReplaceOne = () => {
        col.replaceOne(args.filter, args.data, (err, res) => {
          if (err) {
            callback(err, false);
            return;
          }

          callback({ mongo: res, data: args.data }, true);
        });
      };
      let doAggregate = () => {
        let agg = [];
        if (args.pipeline) {
          args.pipeline.forEach(p => {
            let operator = "$";
            let value = null;

            for (let o in p) {
              operator += o === "filter" ? "match" : o;
              value = p[o];
            }

            if (operator && value) {
              let obj = {};
              obj[operator] = value;
              agg.push(obj);
            }
          });
        } else {
          if (args.filter) agg.push({ $match: args.filter });

          if (args.project) agg.push({ $project: args.project });

          if (args.group) agg.push({ $group: args.group });

          if (args.sort) agg.push({ $sort: args.sort });
        }
        let results = col.aggregate(agg, {
          allowDiskUsage: true,
          cursor: { batchSize: 1000 }
        });
        let objs = [];
        results.on("data", data => {
          objs.push(data);
        });
        results.on("end", () => {
          callback(objs, true);
        });
      };
      let doDistinct = () => {
        col.distinct(args.data, args.filter, (err, res) => {
          if (err) {
            callback(err, false);
            return;
          }

          callback({ data: res }, true);
        });
      };

      switch (args.operation) {
        case "count":
          doCount();
          break;
        case "find":
          doFind();
          break;
        case "insertOne":
          doInsertOne();
          break;
        case "insertMany":
          doInsertMany();
          break;
        case "updateOne":
          doUpdateOne();
          break;
        case "updateMany":
          doUpdateMany();
          break;
        case "deleteOne":
          doDeleteOne();
          break;
        case "deleteMany":
          doDeleteMany();
          break;
        case "replaceOne":
          doReplaceOne();
          break;
        case "pagedData":
          doPagedData();
          break;
        case "aggregate":
          doAggregate();
          break;
        case "distinct":
          doDistinct();
          break;
        default:
          callback("Invalid operation specified for Mongo Handlr", false);
      }
    };
    const ATTEMPTS = 20;
    const WAIT = 5000;
    let attempts = 0;
    let connect = () => {
      let runQuery = db => {
        try {
          execute(db, (res, success) => {
            try {
              if (!success) {
                let index = -1;
                connections.map((c, i) => {
                  if (c.connection && c.connect === args.url) index = i;
                });

                index > 0 && connections.splice(index, 1);
                db.close();
                konsole.error(res);

                if (args && args.callback) args.callback(null, res);

                return;
              }

              let endTime = new Date().getTime();
              konsole.log(
                `${CliColors.FgGreen}END   < ${CliColors.Reset}${
                  args.collection
                }.${args.operation} in ${CliColors.FgGreen}[${endTime -
                  startTime}]${CliColors.Reset}ms`,
                `h${CliColors.BgGreen}${CliColors.FgWhite}.mngo`
              );

              if (args && args.callback) args.callback(res);
            } catch (e) {
              konsole.error(e);

              if (args && args.callback) args.callback(null, e);

              return;
            }
          });
        } catch (e) {
          konsole.error(e);

          if (args && args.callback) args.callback(null, e);

          return;
        }
      };

      let cachedDB = connections.filter(
        c => c.connection && c.connection === args.url
      )[0];

      if (cachedDB && cachedDB.db) {
        runQuery(cachedDB.db);
        return;
      }

      client.connect(
        args.url,
        {
          autoReconnect: true,
          reconnectTries: 10,
          reconnectInterval: 1000
        },
        (err, db) => {
          if (err) {
            if (++attempts <= ATTEMPTS) {
              konsole.log(
                `Connection error, attempt ${attempts}/${ATTEMPTS}`,
                `h${CliColors.BgGreen}${CliColors.FgWhite}.mngo`
              );
              setTimeout(connect, WAIT);
              return;
            }

            konsole.error(err);

            if (args.callback) args.callback(null, err);

            return;
          }

          connections.push({ connection: args.url, db: db });
          runQuery(db);
        }
      );
    };
    connect();
  }
}

export default new Mongo();
