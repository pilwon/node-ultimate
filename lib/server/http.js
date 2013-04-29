/*
 * ultimate.server.http
 */

'use strict';

var http = require('http'),
    util = require('util');

var debug = require('debug')('ultimate.server.http');

var _app = null,
    _server = null;

function _configure() {
  // Proxy use() for grunt-express.
  _server.use = function () {
    _app.servers.express.getServer().use.apply(_app.servers.express.getServer(), arguments);
  };
}

function _listen() {
  var port = process.env.VMC_APP_PORT || process.env.PORT || _app.project.server.port || 3000;

  _server.listen(port, function () {
    debug(util.format('Express HTTP server listening on port %d...', port).cyan);
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
