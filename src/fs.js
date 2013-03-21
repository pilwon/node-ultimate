/*
 * ultimate.fs
 */

'use strict';

var _ = require('lodash'),
    glob = require('glob');

exports.glob = function (pattern, cb) {
  if (!_.isString(pattern)) { pattern = '**/*'; }

  glob(pattern, cb);
};

exports.globSync = function (pattern) {
  if (!_.isString(pattern)) { pattern = '**/*'; }

  return glob.sync(pattern);
};
