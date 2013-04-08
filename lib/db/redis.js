/*
 * ultimate.db.redis
 */

'use strict';

var util = require('util');

var _ = require('lodash'),
    redis = require('redis');

var _client = null;

/**
 * Connect to Redis.
 *
 * @param {Object} app Application.
 * @param {Function} cb Callback.
 * @return {undefined}
 */
function connect(app) {
  if (!_.isObject(app.config.db) ||
      !_.isObject(app.config.db.redis)) {
    throw new Error('Missing object in config: db.redis');
  }

  var vcapRedis = {};
  if (process.env.VCAP_SERVICES) {
    vcapRedis = JSON.parse(process.env.VCAP_SERVICES);
    vcapRedis = VCAP['redis-2.2'][0]['credentials'];
  }

  // Connect
  _client = redis.createClient(
    vcapRedis.port || app.config.db.redis.port || 6379,
    vcapRedis.hostname || app.config.db.redis.host || 'localhost'
  );
  if (vcapRedis.password || app.config.db.redis.password) {
    _client.auth(vcapRedis.password || app.config.db.redis.password);
  }

  // Events
  _client.once('connect', function () {
    console.log('Connected to Redis:'.cyan);
    console.log(util.format(
      'redis://%s:%s',
      vcapRedis.hostname || app.config.db.redis.host || 'localhost',
      vcapRedis.port || app.config.db.redis.port || 6379).bold
    );
  });
  _client.on(
    'error',
    console.error.bind(console, 'Connection error:'.cyan)
  );
}

// Accesssors
function getClient() {
  return _client;
}

// Public API
exports.getClient = getClient;
exports.connect = connect;
