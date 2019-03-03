var babel = require("babel-register")({ presets: ["es2015"] });
var polyFill = require("babel-polyfill");
var debug = require("debug")("BoredPass.Api");
var app = require("./app.js").default;
var config = require("./config.js").default;

app.set("port", process.env.PORT || config.port || 3000);

var server = app.listen(app.get("port"), function() {
  console.log("Express server listening on port " + server.address().port);
});
