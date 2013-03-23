/*
 * ultimate.db.mongoose.error
 */

'use strict';

var util = require('util');

var _ = require('lodash');

exports.send = function (err, res) {
  var msg = err.name + ': ' + err.message,
      keys;
  if (_.isObject(err, 'errors')) {
    keys = _.keys(err.errors);
    _.each(keys, function (key, idx) {
      msg += util.format('\n %s─ ', (idx < keys.length - 1 ? '├' : '└'));
      msg += key + ': ' + err.errors[key].message;
    });
  }
  res.send('<pre>\n' + msg + '\n</pre>');
};
