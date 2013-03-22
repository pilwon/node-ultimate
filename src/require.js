/*
 * ultimate.require
 */

'use strict';

var _ = require('lodash'),
    requireDir = require('require-dir');

exports = module.exports = function (dir, isRecursive) {
  if (!_.isString(dir)) { dir = '.'; }
  if (!_.isBoolean(isRecursive)) { isRecursive = true; }

  return requireDir(dir, {
    recurse: isRecursive
  });
};
