import ListMap from './ListMap';
import config from '../config';
import moment from 'moment';

export default class Controller {
    constructor(root) {
        this.root = root;
        this.handlers = new ListMap();
    }
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
        let express = require('express');
        let router = express.Router();
        let register = (routes, req, res, next) => {
            if (routes && routes.length) {
                routes.forEach((route) => {
                    if (route.secure) {
                        if (config && config.accounts && config.accounts.url) {
                            console.log('[H:i:' + moment().format('YYYY-MM-DDTHH:mm:ss:SSS') + '] Route "' + this.root + route.route + '" is secure. Redirecting to "' + config.accounts.url + '".');
                            res.redirect(config.accounts.url);
                            return;
                        } else
                            console.log('[H:w:' + moment().format('YYYY-MM-DDTHH:mm:ss:SSS') + '] Route "' + this.root + route.route + '" is secure. "config.accounts.url" not specified.');
                        return res.status(401).end();
                    }
                    if (!route.consumes || req.accepts(route.consumes)) {
                        let toLog = '';
                        toLog += '[H:i:' + moment().format('YYYY-MM-DDTHH:mm:ss:SSS') + '] Routing to "' + this.root + route.route + '"';
                        toLog += '\n    > Method         : ' + route.method;
                        toLog += '\n    > Consumes       : ' + route.consumes;
                        toLog += '\n    > Produces       : ' + route.produces;
                        toLog += '\n    > Request query  : ' + JSON.stringify(req.query);
                        toLog += '\n    > Request body   : ' + JSON.stringify(req.body);
                        toLog += '\n    > Request params : ' + JSON.stringify(req.params);
                        console.log(toLog);
                        route.delegate(req, res, next);
                        return;
                    }
                    console.log('[H:e' + moment().format('YYYY-MM-DDTHH:mm:ss:SSS') + '] HTTP 400: Bad request');
                    return res.status(400).end();
                });
            } else {
                console.log('[H:e:' + moment().format('YYYY-MM-DDTHH:mm:ss:SSS') + '] HTTP 404: Route not implemented');
                next(new Error('Route not implemented.'));
            }
        }
        let filterRoutes = (handlr, method) => {
            return handlr.filter((handlr) => {
                return handlr.method.toLowerCase() === method;
            });
        }
        this.handlers.forEach((route, handlr) => {
            let routeGet = filterRoutes(handlr, 'get');
            let routePost = filterRoutes(handlr, 'post');
            let routePut = filterRoutes(handlr, 'put');
            let routeDelete = filterRoutes(handlr, 'delete');
            router.route(route)
                .get((req, res, next) => {
                    register(routeGet, req, res, next);
                })
                .post((req, res, next) => {
                    register(routePost, req, res, next);
                })
                .put((req, res, next) => {
                    register(routePut, req, res, next);
                })
                .delete((req, res, next) => {
                    register(routeDelete, req, res, next);
                });
        });
        return router;
    }
}