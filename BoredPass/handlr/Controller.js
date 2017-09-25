import express from 'express';
import ListMap from './ListMap';
import config from '../config';
import moment from 'moment';

const filterRoutes = (handlr, method) => {
  return handlr.filter((handlr) => {
    return handlr.method.toLowerCase() === method;
  });
}

const register = (root, routes) => {
  let retVal = null;
  if (routes && routes.length) {
    routes.forEach((route) => {
      if (route.secure) {
        if (config && config.accounts && config.accounts.url) {
          console.log('[H:i:' + moment().format('YYYY-MM-DDTHH:mm:ss:SSS') + '] Route "' + root + route.route + '" is secure. Redirecting to "' + config.accounts.url + '".');
          return { redirect: config.accounts.url };
        } else
          console.log('[H:w:' + moment().format('YYYY-MM-DDTHH:mm:ss:SSS') + '] Route "' + root + route.route + '" is secure. "config.accounts.url" not specified.');
        return { status: 401 };
      }
      retVal = {
        route: route,
        delegate: route.delegate
      };
    });
  }
  return retVal;
}

const executeRoute = (root, route, delegate, req, res, next) => {
  console.log(route);
  if (!route.consumes || req.accepts(route.consumes)) {
    let toLog = '';
    toLog += '[H:i:' + moment().format('YYYY-MM-DDTHH:mm:ss:SSS') + '] Routing to "' + root + route.route + '"';
    toLog += '\n    > Method         : ' + route.method;
    toLog += '\n    > Consumes       : ' + route.consumes;
    toLog += '\n    > Produces       : ' + route.produces;
    toLog += '\n    > Request query  : ' + JSON.stringify(req.query);
    toLog += '\n    > Request body   : ' + JSON.stringify(req.body);
    toLog += '\n    > Request params : ' + JSON.stringify(req.params);
    console.log(toLog);
    delegate(req, res, next);
    return;
  }
  console.log('[H:e' + moment().format('YYYY-MM-DDTHH:mm:ss:SSS') + '] HTTP 400: Bad request');
  res.status(400).end();
}

const doRegistration = (root, routes) => {
  if (!routes)
    return (req, res, next) => next(new Error('Route not implemented.'));
  if (routes.status)
    return (req, res, next) => res.status(routes.status).end();
  if (routes.error)
    return (req, res, next) => next(routes.error);
  if (routes.route && routes.delegate && Array.isArray(routes.delegate)) {
    return routes.delegate.map((d, i) => {
      return (req, res, next) => executeRoute(root, routes.route, d, req, res, next);
    });
  }
  if (routes.route && routes.delegate)
    return (req, res, next) => executeRoute(root, routes.route, routes.delegate, req, res, next);
}

export default class Controller {

  /**
   * Creates a new Controller.
   * @param {string} root - The base part of the URL to handle for every request in this controller.
   */
  constructor(root) {
    this.root = root;
    this.handlers = new ListMap();
  }

  /**
   * Register a URL handler against the controller.
   * @param {Object} args - The arguments describing the URL handler.
   * @param {string} args.route - The URL pattern to handle.
   * @param {string} args.method - The HTTP verb that the handler accepts.
   * @param {string} args.produces? - The MIME-type that the handler produces.
   * @param {string} args.consumes? - The MIME-type that the handler consumes.
   * @param {boolean} args.secure? - A value indicating whether the handler is secure and should first check the registered middleware for authentication.
   * @param {function(Object,Object):void} delegate - The handler that accepts an incoming request and writes to an outgoing response. Typical usage: (req, res) => { ... }
   * @param {number} [priority] - A priority associated with the handler to push it ahead of a queue of handlers for the same URL.
   */
  handle(args, delegate, priority) {
    args.method = args.method ? args.method.toLowerCase() : 'get';
    args.produces = args.produces ? args.produces.toLowerCase() : 'html';
    args.consumes = args.consumes != null ? args.consumes.toLowerCase() : null;
    args.secure = args.secure != null ? args.secure : false;
    args.delegate = delegate;
    this.handlers.put(args.route, args, priority);
    return this;
  }

  registerRoutes() {
    let router = express.Router();
    this.handlers.forEach((route, handlr) => {
      let routeGet = filterRoutes(handlr, 'get');
      let routePost = filterRoutes(handlr, 'post');
      let routePut = filterRoutes(handlr, 'put');
      let routeDelete = filterRoutes(handlr, 'delete');
      console.log('[H:i] > Registering route: ' + route + ' at root ' + this.root + ': ' + routeGet.length + ' GET, ' + routePost.length + ' POST, ' + routePut.length + ' PUT, ' + routeDelete.length + ' DELETE');
      router.route(route)
        .get(doRegistration(this.root, register(this.root, routeGet)))
        .post(doRegistration(this.root, register(this.root, routePost)))
        .put(doRegistration(this.root, register(this.root, routePut)))
        .delete(doRegistration(this.root, register(this.root, routeDelete)));
    });
    return router;
  }
}
