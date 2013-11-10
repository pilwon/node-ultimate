/*
 * ultimate.server.socketio
 */

'use strict';

var util = require('util');

var _ = require('lodash'),
    socketio = require('socket.io'),
    redis = require('redis'),
    RedisStore = require('socket.io/lib/stores/redis');

var redisDB = require('../db/redis');

var debug = require('debug')('ultimate.server.socketio');

var _app = null,
    _server = null;

function getServer() {
  return _server;
}

function run(app) {
  _app = app;
  _app.servers.socketio = exports;
  _server = socketio.listen(_app.servers.http.getServer());

  if (!_.isPlainObject(app.config.socketio)) {
    throw new Error('Missing config object: socketio');
  } else if (!_.isString(app.config.socketio.store)) {
    throw new Error('Missing config variable: socketio.store');
  }

  if (app.config.socketio.store === 'redis') {
    _server.set('store', new RedisStore({
      redis: redis,
      redisPub: redisDB.createClient(app.config.db.redis),
      redisSub: redisDB.createClient(app.config.db.redis),
      redisClient: redisDB.createClient(app.config.db.redis)
    }));
  }

  _server.enable('browser client minification');
  _server.enable('browser client etag');
  _server.enable('browser client gzip');
  _server.set('log level', 1);

  debug(util.format('Socket.io server listening...').cyan);
}

// Public API
exports.getServer = getServer;
exports.run = run;
