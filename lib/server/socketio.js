/*
 * ultimate.server.socketio
 */

'use strict';

var util = require('util');

var socketio = require('socket.io');

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

  _server.configure('heroku', function () {
    _server.set('transports', ['xhr-polling']);
    _server.set('polling duration', 10);
  });

  debug(util.format('Socket.io server listening...').cyan);
}

// Public API
exports.getServer = getServer;
exports.run = run;
