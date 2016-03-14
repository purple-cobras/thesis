var path = require('path');
var gulp = require('gulp');
var preprocess = require('gulp-preprocess');
gulp.task('dev', function() {
  gulp.src(path.resolve('appsettings.js'))
    .pipe(preprocess({context: { NODE_ENV: 'DEVELOPMENT', DEBUG: true}}))
    .pipe(gulp.dest('client/www/js/'));
});

gulp.task('test_env', function() {
  gulp.src(path.resolve('appsettings.js'))
    .pipe(preprocess({context: { NODE_ENV: 'TEST', DEBUG: true}}))
    .pipe(gulp.dest('client/www/js/'));
});

gulp.task('prod', function() {
  gulp.src(path.resolve('appsettings.js'))
    .pipe(preprocess({context: { NODE_ENV: 'PRODUCTION'}}))
    .pipe(gulp.dest(path.resolve('client/www/js/')));
});
gulp.task('android', function() {
  gulp.src(path.resolve('appsettings.js'))
    .pipe(preprocess({context: { NODE_ENV: 'ANDROID'}}))
    .pipe(gulp.dest(path.resolve('client/www/js/')));
});