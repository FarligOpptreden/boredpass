var handlr = function () {
    console.log('');
    console.log('[H:i] Starting Handlr application...');
    // Includes
    var express = require('express');
    var path = require('path');
    var fs = require('fs');
    var favicon = require('serve-favicon');
    var logger = require('morgan');
    var cookieParser = require('cookie-parser');
    var bodyParser = require('body-parser');
    
    // Initialize Express
    var app = express();
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
    var traverse = function (folderName) {
        fs.readdirSync(folderName).forEach(function (file) {
            var fullName = path.join(folderName, file);
            var stat = fs.lstatSync(fullName);
            if (stat.isDirectory()) {
                traverse(fullName);
            } else if (file.toLowerCase().indexOf('.js')) {
                var module = require('../' + fullName);
                console.log('[H:i] Registering module: ' + fullName + ' at root ' + module.root);
                app.use(module.root, module.registerRoutes());
            }
        });
    }
    traverse('server/controllers');
    console.log('[H:i] All modules successfully registered!');
    // Error handling
    app.use(function (req, res, next) {
        var err = new Error('Not Found');
        err.status = 404;
        next(err);
    });
    if (app.get('env') === 'development') {
        app.use(function (err, req, res, next) {
            res.status(err.status || 500);
            res.render('error', {
                message: err.message,
                error: err
            });
        });
    }
    app.use(function (err, req, res, next) {
        res.status(err.status || 500);
        res.render('error', {
            message: err.message,
            error: {}
        });
    });
    return app;
}

// Start
module.exports = new function () {
    var expressApp = handlr();
    this.start = function () {
        return expressApp;
    }
};