var gulp = require('gulp');
var sass = require('gulp-sass');
var gls = require('gulp-live-server');

gulp.task('sass', function(done) {
  return gulp.src('./scss/**/*.scss')
    .pipe(sass().on('error', sass.logError))
    .pipe(gulp.dest('./public/css'));
});

gulp.task('sass:watch', function() {
  gulp.watch('./scss/**/*.scss', ['sass']);
});

gulp.task('serve', function() {
  var server = gls.new('app.js');
  server.start();
  gulp.watch('./scss/**/*.scss', ['sass']);
  gulp.watch(['public/css/**/*.css', 'public/js/**/*.js', 'public/img',  'views/**/*.handlebars'], function(file) {
    server.notify.apply(server, [file]);
  });
  gulp.watch('app.js', function() {
    server.start.apply(server);
  });
});
