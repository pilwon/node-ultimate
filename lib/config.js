/*
 * ultimate.config
 */

'use strict';

var path = require('path');

var _ = require('lodash');

var debug = require('debug')('ultimate.config');

exports = module.exports = function (configDir) {
  if (!_.isString(configDir)) { configDir = '.'; }

  process.env.NODE_ENV = process.env.NODE_ENV || 'development';

  var configPath = path.join(path.normalize(configDir), process.env.NODE_ENV);
  debug('Loading config "%s"...', configPath);

  return require(configPath);
};
