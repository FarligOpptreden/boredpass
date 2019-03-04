var gulp = require("gulp");
var less = require("gulp-less");
var cssmin = require("gulp-cssmin");
var rename = require("gulp-rename");

gulp.task("less", function(cb) {
  gulp
    .src([
      "server/less/*.less",
      "!server/less/**/__*.less",
      "!server/less/**/*.mq.less"
    ])
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
    .pipe(
      rename(function(f) {
        f.dirname = "";
      })
    )
    .pipe(
      gulp.dest(function(f) {
        return ".\\public\\css\\";
      })
    );
  cb();
});

gulp.task(
  "watch",
  gulp.series("less", function(cb) {
    gulp.watch("server/less/**/*.less", gulp.series("less"));
    cb();
  })
);
