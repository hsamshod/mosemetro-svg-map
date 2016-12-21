var config      = require('./.gulpconfig.json');
var gulp 		= require('gulp');
var coffee 		= require('gulp-coffee');
var concat 		= require('gulp-concat');
var addsrc 		= require('gulp-add-src');
var sourcemaps = require('gulp-sourcemaps');

var browserSync = require('browser-sync').create();
var coffee_cnf  = config.coffee;

bower_packages = [
    'scripts/bower/jquery/dist/jquery.slim.min.js',
    'scripts/bower/angular/angular.min.js',
    'scripts/bower/underscore/underscore-min.js',
    'scripts/bower/pinchzoom/src/pinchzoom.js',
    'scripts/svg.js'
];

gulp.task('build-vendor', function() {
    gulp.src(bower_packages)
        .pipe(concat(config.bower.bundle))
        .pipe(gulp.dest(config.bower.dest));
});

gulp.task('module', function() {
    gulp.src(coffee_cnf.module.src)
        .pipe(coffee(coffee_cnf.task.options))
        .pipe(sourcemaps.write())
        .pipe(addsrc('scripts/depencies/panzoom/dist/jquery.panzoom.js'))
        .pipe(concat(coffee_cnf.module.bundle))
        .pipe(gulp.dest(coffee_cnf.module.dest));

    browserSync.reload();
});

gulp.task('app', function() {
    gulp.src(coffee_cnf.app.src)
        .pipe(coffee(coffee_cnf.task.options))
        .pipe(concat(coffee_cnf.app.bundle))
        .pipe(gulp.dest(coffee_cnf.app.dest));

    browserSync.reload();
});

gulp.task('watch', ['build-vendor'], function() {
    browserSync.init(config.browsersync.options);

    gulp.watch(coffee_cnf.module.src, ['module', 'build-vendor']);
    gulp.watch(coffee_cnf.app.src, ['app']);
});

gulp.task('default', ['app', 'module', 'build-vendor']);