/*
 * ultimate.db.mongoose.connect
 */

'use strict';

var util = require('util');

var _ = require('lodash'),
    mongoose = require('mongoose');

var debug = require('debug')('ultimate.db.mongoose');

var _client = null;

/**
 * Connect to MongoDB.
 *
 * @param {Object} mongoConfig Mongo config.
 * @param {Object} cb Callback.
 * @return {Client}
 */
function connect(mongoConfig, cb) {
  if (!_.isFunction(cb)) {
    cb = function (err) {
      if (err) { console.error(err); }
    };
  }

  if (!_.isObject(mongoConfig)) {
    return cb('mongoConfig must be an object.');
  }

  var vcapMongo = {};
  if (process.env.VCAP_SERVICES) {
    vcapMongo = JSON.parse(process.env.VCAP_SERVICES);
    vcapMongo = vcapMongo['mongodb-1.8'][0].credentials;
  }

  // Connect
  var uri = util.format(
    'mongodb://%s:%s/%s',
    vcapMongo.hostname || mongoConfig.host || 'localhost',
    vcapMongo.port || mongoConfig.port || 27017,
    vcapMongo.db || mongoConfig.db || 'ultimate'
  );
  if (mongoConfig.username && mongoConfig.password) {
    _client = mongoose.connect(uri, {
      user: mongoConfig.username || null,
      pass: mongoConfig.password || null,
    });
  } else if (vcapMongo.username && vcapMongo.password) {
    _client = mongoose.connect(uri, {
      user: vcapMongo.username || null,
      pass: vcapMongo.password || null,
    });
  } else {
    _client = mongoose.connect(uri);
  }

  // Events
  mongoose.connection.once('open', function () {
    debug('Connected to MongoDB:'.cyan);
    debug(uri.bold);
    return cb();
  });
  mongoose.connection.on('error', function (err) {
    debug('Connection error:'.cyan);
    debug(err);
    return cb(err);
  });

  return _client;
}

// Public API
exports = module.exports = connect;

Object.defineProperty(exports, '_client', {
  get: function () {
    return _client;
  }
});
