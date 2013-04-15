/*
 * ultimate.db.redis
 */

'use strict';

var util = require('util');

var _ = require('lodash'),
    redis = require('redis');

var _client = null;

function createClient(app) {
  if (!_.isObject(app.config.db) ||
      !_.isObject(app.config.db.redis)) {
    throw new Error('Missing object in config: db.redis');
  }

  var vcapRedis = {};
  if (process.env.VCAP_SERVICES) {
    vcapRedis = JSON.parse(process.env.VCAP_SERVICES);
    vcapRedis = vcapRedis['redis-2.2'][0].credentials;
  }

  var host = vcapRedis.hostname || app.config.db.redis.host || 'localhost',
      port = vcapRedis.port || app.config.db.redis.port || 6379;

  var client = redis.createClient(port, host);

  if (app.config.db.redis.password) {
    client.AUTH(vcapRedis.password || app.config.db.redis.password);
  }

  client.once('connect', function () {
    console.log('Connected to Redis:'.cyan);
    console.log(util.format('redis://%s:%s', host, port).bold);
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
  if (_client && _client.connected) { return cb(); }

  _client = createClient(app);

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
