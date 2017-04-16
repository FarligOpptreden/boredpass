import express from 'express';
import path from 'path';
import fs from 'fs';
import favicon from 'serve-favicon';
import logger from 'morgan';
import cookieParser from 'cookie-parser';
import bodyParser from 'body-parser';

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
        app.use(bodyParser.json());
        app.use(bodyParser.urlencoded({ extended: false }));
        app.use(cookieParser());
        app.use(express.static(path.join(__dirname, '../public')));
        // Initialize routes
        let traverse = (folderName) => {
            fs.readdirSync(folderName).forEach((file) => {
                let fullName = path.join(folderName, file);
                let stat = fs.lstatSync(fullName);
                if (stat.isDirectory()) {
                    traverse(fullName);
                } else if (file.toLowerCase().indexOf('.js')) {
                    let module = require('../' + fullName).default;
                    console.log('[H:i] Registering module: ' + fullName + ' at root ' + module.root);
                    app.use(module.root, module.registerRoutes());
                }
            });
        }
        traverse('server/controllers');
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
                    error: err
                });
            });
        }
        app.use((err, req, res, next) => {
            res.status(err.status || 500);
            res.render('error', {
                message: err.message,
                error: {}
            });
        });
        return app;
    }
}