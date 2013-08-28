/*
 * ultimate.server.socketio
 */

'use strict';

var util = require('util');

var socketio = require('socket.io'),
    RedisStore = require('socket.io/lib/stores/redis');

var redis = require('../db/redis');

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

  if (app.config.socketio.store === 'redis') {
    _server.set('store', new RedisStore({
      redisPub: redis.createClient(app.config.db.redis),
      redisSub: redis.createClient(app.config.db.redis),
      redisClient: redis.createClient(app.config.db.redis)
    }));
  }

  _server.enable('browser client minification');
  _server.enable('browser client etag');
  _server.enable('browser client gzip');
  _server.set('log level', 1);

  _server.configure('heroku', function () {
    _server.set('transports', ['xhr-polling']);
    _server.set('polling duration', 10);
  });

  debug(util.format('Socket.io server listening...').cyan);
}

// Public API
exports.getServer = getServer;
exports.run = run;
