var debug = require('debug')('BoredToday');
var app = require('./app.js');
var config = require('./config.js');

app.set('port', process.env.PORT || config.port || 3000);

var server = app.listen(app.get('port'), function () {
    debug('Express server listening on port ' + server.address().port);
});
