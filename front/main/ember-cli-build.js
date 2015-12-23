/* global require, module */
var EmberApp = require('ember-cli/lib/broccoli/ember-app'),
	Funnel = require('broccoli-funnel'),
	babel = require('broccoli-babel-transpiler'),
	BroccoliMergeTrees = require('broccoli-merge-trees'),
	concat = require('broccoli-concat');

module.exports = function (defaults) {
	var app = new EmberApp(defaults, {
		outputPaths: {
			app: {
				html: 'main.hbs'
			}
		},
		hinting: false
	});

	// Use `app.import` to add additional libraries to the generated
	// output files.
	//
	// If you need to use different assets in different
	// environments, specify an object as the first parameter. That
	// object's keys should be the environment name and the values
	// should be the asset to use in that environment.
	//
	// If the library that you are including contains AMD or ES6
	// modules that you would like to import into your application
	// please specify an object with the list of modules as keys
	// along with the exports of each module as its value.


	/*//Mercury modules
	var mercuryModulesTranspiled = new babel('../front/scripts/mercury', {
			modules: 'amd',
			moduleIds: true,
			sourceRoot: 'mercury'
		}),
		mercuryModulesConcatenated = concat(mercuryModulesTranspiled, {
			outputFile: 'assets/mercury.js',
			inputFiles: ['**!/!*.js']
		});

	var baselineTranspiled = new babel('../front/scripts/baseline'),
		baselineConcatenated = concat(baselineTranspiled, {
			outputFile: 'assets/baseline.js',
			inputFiles: ['**!/!*.js']
		});*/

	var common = new Funnel('../common', {
		include: ['**/*.js'],
		destDir: 'assets'
	});

	app.import(app.bowerDirectory + '/script.js/dist/script.js');
	app.import(app.bowerDirectory + '/fastclick/lib/fastclick.js');
	app.import(app.bowerDirectory + '/hammerjs/hammer.js');
	app.import(app.bowerDirectory + '/headroom.js/dist/headroom.js');
	app.import(app.bowerDirectory + '/jquery.cookie/jquery.cookie.js');
	app.import(app.bowerDirectory + '/ember-hammer/ember-hammer.js');
	app.import(app.bowerDirectory + '/i18next/i18next.js');
	app.import(app.bowerDirectory + '/vignette/dist/vignette.js');
	app.import(app.bowerDirectory + '/numeral/numeral.js');
	app.import(app.bowerDirectory + '/weppy/dist/weppy.js');
	app.import(app.bowerDirectory + '/visit-source/dist/visit-source.js');
	app.import(app.bowerDirectory + '/Autolinker.js/dist/Autolinker.min.js');
	app.import(app.bowerDirectory + '/ember-performance-sender/dist/ember-performance-sender.js');


	/*//Server
	var server = new Funnel('../server', {
		include: ['**!/!*.js', '**!/!*.hbs'],
		exclude: ['gulp/!**!/!*', 'node_modules/!**!/!*'],
		destDir: 'server'
	});

	var js = babel(server);*/

	/*var nodeModules = new Funnel('../server', {
		include: ['node_modules/!**!/!*'],
		destDir: 'server'
	});*/

	/*var configTree = new Funnel('../config', {
		include: ['*.js'],
		destDir: 'config'
	});

	var config = babel(configTree);*/

	/*var locales = new Funnel('app/locales', {
		destDir: 'assets/locales'
	});*/



	/*var commonTree = babel(common, {
		modules: "amd",
		moduleIds: true
	});*/

	var appp = app.toTree([common]);//, mercuryModulesConcatenated, baselineConcatenated]);

	/*var mhm = new Funnel(appp, {
		include: ['main.hbs'],
		destDir: 'server/views/_layouts'
	});*/

	return new BroccoliMergeTrees([appp]);
};
