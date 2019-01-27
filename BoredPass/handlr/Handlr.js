import express from 'express';
import path from 'path';
import fs from 'fs';
import favicon from 'serve-favicon';
import logger from 'morgan';
import cookieParser from 'cookie-parser';
import bodyParser from 'body-parser';
import moment from 'moment';
import { konsole } from './_all';

const rawBodySaver = (req, res, buf, encoding) => {
  if (buf && buf.length) {
    req.bodyBuffer = buf;
  }
}

const SIZE_LIMIT = '5mb';
const PARAMETER_LIMIT = 10000;
const MIDDLEWARE = [];

export default class Handlr {
  start() {
    konsole.empty();
    konsole.log('Starting Handlr application...');
    // Initialize Express
    let app = express();
    // Initialize server variables
    app.set('views', path.join(__dirname, '../server/views'));
    app.set('view engine', 'pug');
    //app.use(favicon(__dirname + '/public/favicon.ico'));
    app.use(logger('dev'));
    app.use(bodyParser.raw({ verify: rawBodySaver, type: 'application/octet-stream', limit: SIZE_LIMIT }));
    app.use(bodyParser.json({ verify: rawBodySaver, limit: SIZE_LIMIT }));
    app.use(bodyParser.urlencoded({ verify: rawBodySaver, extended: false, limit: SIZE_LIMIT, parameterLimit: PARAMETER_LIMIT }));
    app.use(cookieParser());
    app.use(express.static(path.join(__dirname, '../public')));
    // Initialize middleware
    let traverseMiddleware = (folderName) => {
      if (!fs.existsSync(folderName))
        return;
      fs.readdirSync(folderName).forEach((file) => {
        let fullName = path.join(folderName, file);
        let stat = fs.lstatSync(fullName);
        if (stat.isDirectory())
          return;
        if (file.toLowerCase().indexOf('.js')) {
          let module = require('../' + fullName).default;
          konsole.log(`Registering middleware: ${fullName}`);
          if (module) {
            MIDDLEWARE.push(module);
            module.get(app);
          }
        }
      });
    }
    traverseMiddleware('server/middleware');
    // Initialize routes
    let traverseRoutes = (folderName) => {
      if (!fs.existsSync(folderName))
        return;
      fs.readdirSync(folderName).forEach((file) => {
        let fullName = path.join(folderName, file);
        let stat = fs.lstatSync(fullName);
        if (stat.isDirectory()) {
          traverseRoutes(fullName);
        } else if (file.toLowerCase().indexOf('.js')) {
          let module = require('../' + fullName).default;
          if (!module || !module.root)
            return;
          konsole.log(`Registering module: ${fullName} at root ${module.root}`);
          app.use(module.root, module.registerRoutes());
        }
      });
    }
    traverseRoutes('server/controllers');
    konsole.log(`All modules successfully registered!`);
    // Error handling
    app.use((req, res, next) => {
      let err = new Error('Not Found');
      err.status = 404;
      next(err);
    });
    if (app.get('env') === 'development') {
      app.use((err, req, res, next) => {
        konsole.error(`Uncaught controller exception: ${JSON.stringify(err)}`);
        res.status(err.status || 500);
        res.render('error', {
          message: err.message,
          error: err,
          req: req
        });
      });
    }
    app.use((err, req, res, next) => {
      res.status(err.status || 500);
      konsole.error(`Uncaught controller exception: ${JSON.stringify(err)}`);
      res.render('error', {
        message: err.message,
        error: {},
        req: req
      });
    });
    if (MIDDLEWARE && MIDDLEWARE.length)
      MIDDLEWARE.map((mw) => {
        if (mw.error)
          mw.error(app);
      });
    return app;
  }
}