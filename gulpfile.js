const gulp = require('gulp');
const sass = require('gulp-sass');
const gls = require('gulp-live-server');
const autoprefixer = require('gulp-autoprefixer');
const csso = require('gulp-csso');
const del = require('del');
const runSequence = require('run-sequence');
const terser = require('gulp-terser');

const AUTOPREFIXER_BROWSERS = [
  'ie >= 10',
  'ie_mob >= 10',
  'ff >= 30',
  'chrome >= 34',
  'safari >= 7',
  'opera >= 23',
  'ios >= 7',
  'android >= 4.4',
  'bb >= 10'
];

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

// Minify CSS files
gulp.task('minStyles', function() {
  return gulp.src('./public/css/styles.css')
  // Auto-prefix css styles for cross browser compatibility
  .pipe(autoprefixer({browsers: AUTOPREFIXER_BROWSERS}))
  // Minify file
  .pipe(csso())
  // Output
  .pipe(gulp.dest('./dist/css'))
});

// Minify JS files
gulp.task('minScripts', function() {
  return gulp.src('./public/js/**/*.js')
  // Minify files
  .pipe(terser())
  .pipe(gulp.dest('./dist/js'))
});

// Reset dist (output) folder
gulp.task('clean', function() {
  del(['dist']);
});

// Copy images from public folder to dist folder
// Images should already be compressed...
gulp.task('moveImages', function() {
  return gulp.src('./public/img/*')
  .pipe(gulp.dest('./dist/img'))
});
