/**
 * Created by jmunoza on 02/11/15.
 */
var gulp = require('gulp');

var browserify = require('browserify');
var reactify = require('reactify');
var source = require('vinyl-source-stream');

gulp.task('js', function(){
  browserify('./public/javascripts/src/app.jsx')
    .transform(reactify)
    .bundle()
    .pipe(source('app.js'))
    .pipe(gulp.dest('public/javascripts/build/'));
});

gulp.task('default', ['js']);