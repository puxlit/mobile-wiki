var gulp = require('gulp'),
	sass = require('gulp-sass'),
	concat = require('gulp-concat'),
	uglify = require('gulp-uglify'),
	gulpif = require('gulp-if'),
	changed = require('gulp-changed'),
	rev = require('gulp-rev'),
	assets = require('../assets'),
	environment = require('../util/environment'),
	paths = require('../paths').components;

gulp.task('components', function () {
	Object.keys(assets).forEach(function(key){
		var files = assets[key].map(function(asset){
			return paths.in + asset;
		});

		gulp.src(files)
			.pipe(changed(paths.out, { extension: '.js' }))
			.pipe(concat(key + '.js'))
			.pipe(gulpif(environment === 'prod', uglify()))
			.pipe(rev())
			.pipe(gulp.dest(paths.out))
			.pipe(rev.manifest())
			.pipe(gulp.dest(paths.out));
	});
});
