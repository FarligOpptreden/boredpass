var gulp = require("gulp");
var less = require("gulp-less");
var cssmin = require("gulp-cssmin");
var rename = require("gulp-rename");
var path = require("path");

var source = ".\\server\\less\\";
var destination = ".\\public\\css\\";
var files = [source + "*.less", "!" + source + "__*.less", "!" + source + "*.mq.less"];

gulp.task("less", function(cb) {
  gulp
    .src(files)
    .pipe(
      less().on("error", function(err) {
        console.error(err);
      })
    )
    .pipe(
      cssmin().on("error", function(err) {
        console.error(err);
      })
    )
    .pipe(rename({ suffix: ".min" }))
    .pipe(rename(function (f) {
      f.dirname = "";
    }))
    .pipe(
      gulp.dest(function(f) {
        return destination;
      })
    );
  cb();
});

gulp.task(
  "default",
  gulp.series("less", function(cb) {
    gulp.watch(files, gulp.series("less"));
    cb();
  })
);
