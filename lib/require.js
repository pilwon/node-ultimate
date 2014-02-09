/*
 * ultimate.require
 */

'use strict';

var fs = require('fs');

var _ = require('lodash'),
    requireAll = require('require-all');

exports = module.exports = function (dir) {
  if (!_.isString(dir) || _.isEmpty(dir)) {
    throw new Error('"dir" mut be a non-empty string.');
  }

  return fs.existsSync(dir) ? requireAll(dir) : {};
};
