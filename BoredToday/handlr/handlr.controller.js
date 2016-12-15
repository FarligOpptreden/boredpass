var listMap = require('./handlr.listMap.js');
var config = require('../config.js');
var moment = require('moment');

var handlrController = function (root) {
    var ctx = this;
    var handlrs = listMap.ListMap();
    this.root = root;
    this.handle = function (args, delegate, priority) {
        args.method = args.method ? args.method.toLowerCase() : 'get';
        args.produces = args.produces ? args.produces.toLowerCase() : 'html';
        args.consumes = args.consumes != null ? args.consumes.toLowerCase() : null;
        args.secure = args.secure != null ? args.secure : false;
        args.delegate = delegate;
        handlrs.put(args.route, args, priority);
        return ctx;
    }
    this.registerRoutes = function () {
        var express = require('express');
        var router = express.Router();
        var register = function (routes, req, res, next) {
            if (routes && routes.length) {
                routes.forEach(function (route) {
                    if (route.secure) {
                        if (config && config.accounts && config.accounts.url) {
                            console.log('[H:i:' + moment().format('YYYY-MM-DDTHH:mm:ss:SSS') + '] Route "' + ctx.root + route.route + '" is secure. Redirecting to "' + config.accounts.url + '".');
                            res.redirect(config.accounts.url);
                            return;
                        } else
                            console.log('[H:w:' + moment().format('YYYY-MM-DDTHH:mm:ss:SSS') + '] Route "' + ctx.root + route.route + '" is secure. "config.accounts.url" not specified.');
                        return res.status(401).end();
                    }
                    if (!route.consumes || req.accepts(route.consumes)) {
                        var toLog = '';
                        toLog += '[H:i:' + moment().format('YYYY-MM-DDTHH:mm:ss:SSS') + '] Routing to "' + ctx.root + route.route + '"';
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
        var filterRoutes = function (handlr, method) {
            return handlr.filter(function (handlr) {
                return handlr.method.toLowerCase() === method;
            });
        }
        handlrs.forEach(function (route, handlr) {
            var routeGet = filterRoutes(handlr, 'get');
            var routePost = filterRoutes(handlr, 'post');
            var routePut = filterRoutes(handlr, 'put');
            var routeDelete = filterRoutes(handlr, 'delete');
            router.route(route)
            .get(function (req, res, next) {
                register(routeGet, req, res, next);
            })
            .post(function (req, res, next) {
                register(routePost, req, res, next);
            })
            .put(function (req, res, next) {
                register(routePut, req, res, next);
            })
            .delete(function (req, res, next) {
                register(routeDelete, req, res, next);
            });
        });
        return router;
    }
}

module.exports = new function () {
    this.Get = function (root) {
        return new handlrController(root);
    }
}