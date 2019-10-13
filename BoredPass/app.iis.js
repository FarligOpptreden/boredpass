var babel = require("babel-register")({ presets: ["es2015"] });
var polyFill = require("babel-polyfill");
var dotenv = require("dotenv");
dotenv.config();
var app = require("./app.js").default;

app.set("port", process.env.PORT || 3000);

var server = app.listen(app.get("port"), function() {
  console.log("Express server listening on port " + server.address().port);
});
