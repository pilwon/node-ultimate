/*
 * ultimate.util.uuid
 */

'use strict';

var _ = require('lodash'),
    uuid = require('uuid');

exports = module.exports = function (options) {
  var result = '';

  if (!_.isObject(options)) { options = {}; }
  if (!_.isBoolean(options.dash)) { delete options.dash; }
  if (!_.isNumber(options.length)) { delete options.length; }

  _.defaults(options, {
    dash: true,
    length: -1
  });

  while (result.length < options.length || options.length < 0) {
    if (options.dash) {
      if (result.length > 0) { result += '-'; }
      result += uuid.v4();
    } else {
      result += uuid.v4().replace(/-/g, '');
    }
    if (options.length < 0 && result.length >= 36) {
      return result.substring(0, 36);
    }
  }

  return result.substring(0, options.length);
};
