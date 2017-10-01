import express from 'express';
import path from 'path';
import fs from 'fs';
import favicon from 'serve-favicon';
import logger from 'morgan';
import cookieParser from 'cookie-parser';
import bodyParser from 'body-parser';
import moment from 'moment';

const rawBodySaver = (req, res, buf, encoding) => {
  if (buf && buf.length) {
    req.bodyBuffer = buf;
  }
}

export default class Handlr {
  start() {
    console.log('');
    console.log('[H:i] Starting Handlr application...');
    // Initialize Express
    let app = express();
    // Initialize server variables
    app.set('views', path.join(__dirname, '../server/views'));
    app.set('view engine', 'pug');
    //app.use(favicon(__dirname + '/public/favicon.ico'));
    app.use(logger('dev'));
    app.use(bodyParser.raw({ verify: rawBodySaver, type: 'application/octet-stream' }));
    app.use(bodyParser.json({ verify: rawBodySaver }));
    app.use(bodyParser.urlencoded({ verify: rawBodySaver, extended: false }));
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
          console.log('[H:i] Registering middleware: ' + fullName);
          if (module) module.get(app);
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
          console.log('[H:i] Registering module: ' + fullName + ' at root ' + module.root);
          app.use(module.root, module.registerRoutes());
        }
      });
    }
    traverseRoutes('server/controllers');
    console.log('[H:i] All modules successfully registered!');
    // Error handling
    app.use((req, res, next) => {
      let err = new Error('Not Found');
      err.status = 404;
      next(err);
    });
    if (app.get('env') === 'development') {
      app.use((err, req, res, next) => {
        res.status(err.status || 500);
        res.render('error', {
          message: err.message,
          error: err,
          moment: moment
        });
      });
    }
    app.use((err, req, res, next) => {
      res.status(err.status || 500);
      res.render('error', {
        message: err.message,
        error: {},
          moment: moment
      });
    });
    return app;
  }
}
