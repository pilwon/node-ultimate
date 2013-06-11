/*
 * ultimate.require
 */

'use strict';

var fs = require('fs');

var _ = require('lodash'),
    requireDir = require('require-dir');

exports = module.exports = function (dir, isRecursive) {
  if (!_.isString(dir)) { dir = '.'; }
  if (!_.isBoolean(isRecursive)) { isRecursive = true; }

  return fs.existsSync(dir) ? requireDir(dir, {
    recurse: isRecursive
  }) : {};
};
