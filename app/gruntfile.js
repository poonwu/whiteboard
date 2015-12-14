/**
 * Represents the grunt file
 *
 * @author poonwu
 * @version 1.0.0
 */

'use strict';

module.exports = function(grunt) {

	// bower library
	var lib = [
		'app/components/lodash/lodash.js',
		'app/components/jquery/dist/jquery.js',
		'app/components/socket.io-client/socket.io.js'
	];

	// main library
	var main = [
		'app/js/canvas.js',
		'app/js/main.js',
		'app/css/main.css'
	];

	// configuration
	grunt.initConfig({
		jshint: {
			files: ['app/js/**/*.js', 'gruntfile.js'],
			options: {
				jshintrc: true
			}
		},

		injector: {
			options: {
				min: true,
				relative: true
			},
			all: {
				files: {
					'app/index.html' : lib.concat(main)
				}
			}
		},

		connect: {
			main: {
				options: {
					base: 'app',
					port: 8000,
					open: true,
					livereload: true
				}
			}
		},

		watch: {
			all: {
				files: ['app/**/*.js', 'app/**/*.css', 'app/**/*.html', '!app/components/**/*'],
				tasks: ['jshint', 'injector']
			}
		}
	});

	// load plugins
	require('load-grunt-tasks')(grunt);

	grunt.registerTask('default', ['jshint', 'injector', 'connect:main:keepalive']);
	grunt.registerTask('dev', ['jshint', 'injector', 'connect', 'watch']);
};
