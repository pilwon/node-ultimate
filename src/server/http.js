/*
 * ultimate.server.http
 */

'use strict';

var http = require('http');

var _app = null,
    _server = null;

function _configure() {
  // Proxy use() for grunt-express.
  _server.use = function () {
    _app.servers.express.getServer().use.apply(_app.servers.express.getServer(), arguments);
  };
}

function _listen() {
  var port = _app.servers.express.getServer().get('port');
  _server.listen(port, function () {
    console.log('Server listening on port ' + port);
  });
}

function getServer() {
  return _server;
}

function run(app) {
  _app = app;
  _app.servers.http = exports;
  _server = http.createServer(_app.servers.express.getServer());
  _configure();
  _listen();
}

// Public API
exports.getServer = getServer;
exports.run = run;
