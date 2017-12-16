'use strict';

// Plugins
var gulp = require('gulp'),
    uglifyes = require('gulp-uglify-es').default,
    htmlmin = require('gulp-htmlmin'),
    cssmin = require('gulp-clean-css'),
    image = require('gulp-image');

// Minify .html files
gulp.task('min-html', function() {
    return gulp.src('src/*.html')
        .pipe(htmlmin({collapseWhitespace: true}))
        .pipe(gulp.dest('dist'));
});

// Minify .js files
gulp.task('min-js', function () {
    return gulp.src('src/**/*.js')
        .pipe(uglifyes())
        .pipe(gulp.dest('dist'));
});

// Minify .css files
gulp.task('min-css', function(){
    return gulp.src('src/**/*.css')
        .pipe(cssmin())
        .pipe(gulp.dest('dist'));
});

// Run all the above tasks at once
gulp.task('default', ['min-html', 'min-js', 'min-css']);

// Optimize Images
gulp.task('min-img', function () {
    gulp.src('src/**/*.{gif,jpg,png}')
        .pipe(image())
        .pipe(gulp.dest('dist'));
});