/*
 * Gruntfile.js
 */

'use strict';

module.exports = function (grunt) {
  // load all grunt tasks
  require('matchdep').filterDev('grunt-*').forEach(grunt.loadNpmTasks);

  // Project configuration.
  grunt.initConfig({
    jshint: {  // grunt-contrib-jshint
      options: {
        jshintrc: '.jshintrc'
      },
      all: [
        '**/*.js',
        '!node_modules/**/*'
      ]
    },
    mochaTest: {  // grunt-mocha-test
      files: ['test/**/*.js']
    },
    mochaTestConfig: {  // grunt-mocha-test
      options: {
        reporter: 'nyan'
      }
    },
    watch: {  // grunt-contrib-watch
      all: {
        files: [
          '*.js',
          'lib/**/*.js'
        ],
        tasks: 'test'
      }
    }
  });

  grunt.registerTask('test', [
    'jshint',
    'mochaTest',
    'watch'
  ]);

  grunt.registerTask('t', 'test');

  grunt.registerTask('default', [
    'test'
  ]);
};
