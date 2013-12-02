/*
 * ultimate.db.redis
 */

'use strict';

var url = require('url'),
    util = require('util');

var _ = require('lodash'),
    redis = require('redis');

var debug = require('debug')('ultimate.db.redis');

var _client = null;

function createClient(defaultRedisConfig, onConnectCallback) {
  var redisConfig = getConfig(defaultRedisConfig);

  var client = redis.createClient(redisConfig.port, redisConfig.host);

  if (redisConfig.password) {
    client.AUTH(redisConfig.password);
  }

  client.once('connect', function () {
    debug('Connected to Redis:'.cyan);
    debug(util.format('redis://%s:%s', redisConfig.host, redisConfig.port).bold);
    if (onConnectCallback) { onConnectCallback(); }
  });

  client.on('error', function (err) {
    debug('Connection error:'.cyan);
    debug(err);
  });

  return client;
}

/**
 * Connect to Redis.
 *
 * @param {Object} defaultRedisConfig Redis config.
 * @param {Function} cb Callback.
 * @return {Client}
 */
function connect(defaultRedisConfig, cb) {
  if (!_.isFunction(cb)) {
    cb = function (err) {
      if (err) { console.error(err); }
    };
  }

  var redisConfig = getConfig(defaultRedisConfig);

  if (_client && _client.connected) { return cb(); }

  if (!_.isObject(redisConfig)) {
    throw new Error('redisConfig must be an object.');
  }

  _client = createClient({
    host: redisConfig.host || 'localhost',
    port: redisConfig.port || 6379,
    password: redisConfig.password
  });

  _client.once('connect', function () {
    return cb();
  });

  _client.on('error', function (err) {
    return cb(err);
  });

  return _client;
}

function getClient() {
  return _client;
}

function getConfig(defaultConfig) {
  if (!_.isPlainObject(defaultConfig)) { defaultConfig = {}; }

  var redisUrl = url.parse(process.env.REDISTOGO_URL || process.env.REDISCLOUD_URL || '');

  return {
    host: redisUrl.href ? redisUrl.hostname : defaultConfig.host,
    port: parseInt(redisUrl.href ? redisUrl.port : defaultConfig.port, 10),
    password: redisUrl.href ? redisUrl.auth.split(':')[1] : defaultConfig.password,
    namespace: defaultConfig.namespace
  };
}

function publish(channel, message) {
  _client.PUBLISH(channel, message);
}

// Public API
exports.getClient = getClient;
exports.getConfig = getConfig;
exports.createClient = createClient;
exports.connect = connect;
exports.publish = publish;
