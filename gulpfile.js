/**
 * Created by jmunoza on 02/11/15.
 */
var gulp = require('gulp');
var sass = require('gulp-sass');

var browserify = require('browserify');
var reactify = require('reactify');
var source = require('vinyl-source-stream');

var bower = require('gulp-bower');



gulp.task('js', function(){
  browserify('./public/javascripts/src/app.jsx')
    .transform(reactify)
    .bundle()
    .pipe(source('app.js'))
    .pipe(gulp.dest('public/javascripts/build/'));
});

gulp.task('sass', function() {
  gulp.src('public/stylesheets/scss/*.scss')
    .pipe(sass())
    .pipe(gulp.dest('public/stylesheets/css'));
});

gulp.task('bower', function() {
  return bower()
    .pipe(gulp.dest('public/javascripts/build/'));
});

gulp.task('watch', function() {
  gulp.watch('public/javascripts/src/**/*.js', ['js']);
  gulp.watch('public/stylesheets/scss/*.scss', ['sass']);
});

gulp.task('default', ['bower', 'js', 'sass', 'watch']);