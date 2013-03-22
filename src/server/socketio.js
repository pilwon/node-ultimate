/*
 * ultimate.server.socketio
 */

'use strict';

var socketio = require('socket.io');

var _app = null,
    _server = null;

function _configure() {
  _server.sockets.on('connection', function (socket) {
    socket.emit('hello', { hello: 'world' });
    socket.on('test', function (data) {
      console.log(data);
    });
  });
}

function getServer() {
  return _server;
}

function run(app) {
  _app = app;
  _app.servers.socketio = exports;
  _server = socketio.listen(_app.servers.http.getServer());
  _configure();
}

// Public API
exports.getServer = getServer;
exports.run = run;
