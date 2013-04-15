/*
 * ultimate.db.mongo
 */

'use strict';

var util = require('util');

var _ = require('lodash'),
    mongoose = require('mongoose');

var _client = null;

/**
 * Connect to MongoDB.
 *
 * @param {Object} app Application.
 * @param {Object} cb Callback.
 * @return {undefined}
 */
function connect(app, cb) {
  if (!_.isFunction(cb)) {
    cb = function (err) {
      if (err) { console.error(err); }
    };
  }

  if (!_.isObject(app.config.db) ||
      !_.isObject(app.config.db.mongo)) {
    return cb('Missing object in config: db.mongo');
  }

  var vcapMongo = {};
  if (process.env.VCAP_SERVICES) {
    vcapMongo = JSON.parse(process.env.VCAP_SERVICES);
    vcapMongo = vcapMongo['mongodb-1.8'][0].credentials;
  }

  // Connect
  var uri = util.format(
    'mongodb://%s:%s/%s',
    vcapMongo.hostname || app.config.db.mongo.host || 'localhost',
    vcapMongo.port || app.config.db.mongo.port || 27017,
    vcapMongo.db || app.config.db.mongo.db || 'ultimate'
  );
  if (app.config.db.mongo.username && app.config.db.mongo.password) {
    _client = mongoose.connect(uri, {
      user: app.config.db.mongo.username || null,
      pass: app.config.db.mongo.password || null,
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
    console.log('Connected to MongoDB:'.cyan);
    console.log(uri.bold);
    return cb();
  });
  mongoose.connection.on('error', function (err) {
    console.log('Connection error:'.cyan);
    console.log(err);
    return cb(err);
  });
}

// Accesssors
function getClient() {
  return _client;
}

// Public API
exports.getClient = getClient;
exports.connect = connect;
