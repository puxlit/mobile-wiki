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

gulp.task('build-combined', ['vendor', 'scripts'], function () {
	var src = [
		'front/loader.js',
		'vendor/jquery/dist/jquery.min.js',
		'vendor/jquery-bigtext/jquery-bigtext.js',
		'vendor/rsvp.js/rsvp.min.js',
		'vendor/slick.js/slick/slick.min.js',
		'front/js/main.js',
		'front/js/globals.js'];

	if (!environment.isProduction) {
		src.push('front/js/dev.js');
	}

	return piper(
		gulp.src(src),
		gulpconcat('combined.js'),
		//gulpif(environment.isProduction, piper(
		//	uglify()
		//)),
		gulp.dest('front/js')
	);
});
