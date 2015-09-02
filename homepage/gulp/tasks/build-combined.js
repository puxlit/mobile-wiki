/*
 * build-combined
 * Combines templates/main.js, scripts/mercury.js, and scripts/main.js into scripts/combined.js
 */
var gulp = require('gulp'),
	gulpif = require('gulp-if'),
	uglify = require('gulp-uglify'),
	environment = require('../utils/environment.js'),
	gulpconcat = require('gulp-concat'),
	piper = require('../utils/piper');

gulp.task('build-combined', ['scripts'], function () {
	var src = ['front/js/main.js'];

	if (!environment.isProduction) {
		src.push('front/js/dev.js');
	}

	return piper(
		gulp.src(src),
		gulpconcat('combined.js'),
		gulpif(environment.isProduction, piper(
			uglify()
		)),
		gulp.dest('front/js')
	);
});
