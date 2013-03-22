/*
 * index.js
 */

var requireDir = require('require-dir');

exports = module.exports = requireDir('./src', {
	recurse: true
});
