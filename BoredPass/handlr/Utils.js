const ARR_EXT = require('./_arrayExtensions');

class _Utils {
  constructor() { }

  /**
   * Generates a random integer between the supplied bounds.
   * @param {Number} min - The lowest number that can be generated. 
   * @param {Number} max - The highest number that can be generated.
   * @returns {Number} - A randomly generated integer.
   */
  randomInt(min, max) {
    min = Math.ceil(min);
    max = Math.floor(max);
    return Math.floor(Math.random() * (max - min + 1)) + min;
  }

  /**
   * Generates a random floating point number between the supplied bounds.
   * @param {Number} min - The lowest number that can be generated. 
   * @param {Number} max - The highest number that can be generated.
   * @returns {Number} - A randomly generated float.
   */
  randomFloat(min, max) {
    return (Math.random() * (max - min + 1)) + min;
  }

  /**
   * Initiates a promise chain for multiple asynchronous calls.
   * @returns {Promise} - A promise object handling the response.
   */
  chain() {
    return new Promise((resolve, reject) => resolve());
  }

  /**
   * Initiates a serial promise chain.
   * @param {Array} funcs - An array of functions returning promises to execute in serial
   * @returns {Promise} - A promise object handling the response. 
   */
  serial(funcs) {
    return funcs.reduce((promise, func) =>
      promise.then(result => func().then(Array.prototype.concat.bind(result))),
      Promise.resolve([]));
  }

  /**
   * Rejects a promise chain with the specified reason.
   * @param {object} reason The reason that the promise chain failed
   * @returns {Promise} - A promise object handling the response. 
   */
  reject(reason) {
    return new Promise((resolve, reject) => reject(reason));
  }

  /**
   * Resolves a promise chain with the specified reason.
   * @param {object} reason The data to resolve with
   * @returns {Promise} - A promise object handling the response. 
   */
  resolve(reason) {
    return new Promise((resolve, reject) => resolve(reason));
  }
}

export const Utils = new _Utils();