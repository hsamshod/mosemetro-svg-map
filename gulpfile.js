var config      = require('./.gulpconfig.json');
var gulp 		= require('gulp');
var coffee 		= require('gulp-coffee');
var concat 		= require('gulp-concat');

var browserSync = require('browser-sync').create();
var coffee_cnf  = config.coffee;

bower_packages = [
    'js/bower/jquery/dist/jquery.slim.min.js',
    'js/bower/angular/angular.min.js',
    'js/bower/underscore/underscore.min.js',
    'js/bower/panzoom/jquery.panzoom.min.js',
    'js/bower/panzoom/pinchzoom.js'
];

gulp.task('build-vendor', function() {
    gulp.src(bower_packages)
        .pipe(concat(config.bower.bundle))
        .pipe(gulp.dest(config.bower.dest));
});

gulp.task('assets', function() {
    gulp.src(coffee_cnf.assets.src)
        .pipe(coffee(coffee_cnf.task.options))
        .pipe(concat(coffee_cnf.assets.bundle))
        .pipe(gulp.dest(coffee_cnf.assets.dest));

    browserSync.reload();
});

gulp.task('watch', ['build-vendor'], function() {
    browserSync.init(config.browsersync.options);

    gulp.watch(coffee_cnf.assets.src, ['assets']);
});

gulp.task('default', ['assets', 'build-vendor']);