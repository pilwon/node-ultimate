/*
 * ultimate.db.redis
 */

'use strict';

var util = require('util');

var _ = require('lodash'),
    redis = require('redis');

var _client = null;

function createClient(redisConfig, onConnectCallback) {
  var client = redis.createClient(redisConfig.port, redisConfig.host);

  if (redisConfig.password) {
    client.AUTH(redisConfig.password);
  }

  client.once('connect', function () {
    console.log('Connected to Redis:'.cyan);
    console.log(util.format('redis://%s:%s', redisConfig.host, redisConfig.port).bold);
    if (onConnectCallback) { onConnectCallback(); }
  });

  client.on('error', function (err) {
    console.log('Connection error:'.cyan);
    console.log(err);
  });

  return client;
}

/**
 * Connect to Redis.
 *
 * @param {Object} redisConfig Redis config.
 * @param {Function} cb Callback.
 * @return {undefined}
 */
function connect(app, cb) {
  if (!_.isFunction(cb)) {
    cb = function (err) {
      if (err) { console.error(err); }
    };
  }

  if (_client && _client.connected) { return cb(); }

  if (!_.isObject(app.config.db) ||
      !_.isObject(app.config.db.redis)) {
    throw new Error('Missing object in config: db.redis');
  }

  var vcapRedis = {};
  if (process.env.VCAP_SERVICES) {
    vcapRedis = JSON.parse(process.env.VCAP_SERVICES);
    vcapRedis = vcapRedis['redis-2.2'][0].credentials;
  }

  _client = createClient({
    host: vcapRedis.hostname || app.config.db.redis.host || 'localhost',
    port: vcapRedis.port || app.config.db.redis.port || 6379,
    password: vcapRedis.password || app.config.db.redis.password
  });

  _client.once('connect', function () {
    return cb();
  });

  _client.on('error', function (err) {
    return cb(err);
  });
}

function publish(channel, message) {
  _client.PUBLISH(channel, message);
}

// Accesssors
function getClient() {
  return _client;
}

// Public API
exports.getClient = getClient;
exports.createClient = createClient;
exports.connect = connect;
exports.publish = publish;
