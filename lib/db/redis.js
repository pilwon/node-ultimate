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

  // Connect
  _client = redis.createClient(
    app.config.db.redis.port || 6379,
    app.config.db.redis.host || 'localhost'
  );
  if (app.config.db.redis.password) {
    _client.auth(app.config.db.redis.password || null);
  }

  // Events
  _client.once('connect', function () {
    console.log('Connected to Redis:'.cyan);
    console.log(util.format(
      'redis://%s:%s',
      app.config.db.redis.host,
      app.config.db.redis.port).bold
    );
  });
  _client.on(
    'error',
    console.error.bind(console, 'Connection error:'.cyan)
  );

  // _client.on('error', function (err) {
  //   console.log('Error ' + err);
  // });

  // _client.set('string key', 'string val', redis.print);
  // _client.hset('hash key', 'hashtest 1', 'some value', redis.print);
  // _client.hset(['hash key', 'hashtest 2', 'some other value'], redis.print);
  // _client.hkeys('hash key', function (err, replies) {
  //   console.log(replies.length + ' replies:');
  //   replies.forEach(function (reply, i) {
  //     console.log('    ' + i + ': ' + reply);
  //   });
  //   _client.quit();
  // });
}

// Accesssors
function getClient() {
  return _client;
}

// Public API
exports.getClient = getClient;
exports.connect = connect;
