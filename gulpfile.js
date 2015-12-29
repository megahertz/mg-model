var gulp = require('gulp');

var config = {
    testsJs: [
        './bower_components/angular/angular.js',
        './bower_components/angular-mocks/angular-mocks.js',
        './src/**/*.js',
        './tests/**/*.spec.js'
    ],
    alljs: [
        './src/**/*.js',
        './*.js'
    ]
};

gulp.task('help', require('gulp-task-listing'));
gulp.task('default', ['help']);

/**
 * vet the code and create coverage report
 */
gulp.task('vet', function() {
    var jshint = require('gulp-jshint');
    var jscs = require('gulp-jscs');

    return gulp
        .src(config.alljs)
        .pipe(jshint())
        .pipe(jshint.reporter('jshint-stylish', {verbose: true}))
        .pipe(jshint.reporter('fail'))
        .pipe(jscs())
        .pipe(jscs.reporter());
});

gulp.task('test', ['vet'], function() {
    var jasmineBrowser = require('gulp-jasmine-browser');
    return gulp.src(config.testsJs)
        .pipe(jasmineBrowser.specRunner({console: true}))
        .pipe(jasmineBrowser.headless());
});

gulp.task('test-browser', require('gulp-jasmine-livereload-task')({
    files: config.testsJs
}));

gulp.task('build-assets', function() {
    return gulp.src([
            './README.md',
            './LICENSE'
        ])
        .pipe(gulp.dest('dist'));
});

gulp.task('build', ['test', 'build-assets'], function() {
    return gulp.src('src/*.js')
        .pipe(require('gulp-concat')('mgmodel.js'))
        .pipe(gulp.dest('dist'))
        .pipe(require('gulp-concat')('mgmodel.min.js'))
        .pipe(require('gulp-ng-annotate')())
        .pipe(require('gulp-uglify')())
        .pipe(gulp.dest('dist'));
});