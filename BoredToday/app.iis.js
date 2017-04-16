var babel = require('babel-register')({ presets: ['es2015'] });
var debug = require('debug')('LCBM.Api');
var app = require('./app.js').default;
var config = require('./config.js');

app.set('port', process.env.PORT || config.port || 3000);

var server = app.listen(app.get('port'), function () {
    debug('Express server listening on port ' + server.address().port);
});
