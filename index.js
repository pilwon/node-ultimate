/*
 * index.js
 */

var requireDir = require('require-dir');

require('colors');

exports = module.exports = requireDir('./lib', {
	recurse: true
});
