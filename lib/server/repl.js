/*
 * ultimate.server.repl
 *
 * Attach REPL to the process so that server admin can be ready for chaos.
 */

'use strict';

var fs = require('fs'),
    net = require('net'),
    repl = require('repl'),
    util = require('util');

var _ = require('lodash');

var debug = require('debug')('ultimate.server.repl');

var SOCKET_PATH = '/tmp/ultimate-repl',
    PROMPT_PREFIX = 'ultimate';

var _app = null,
    _replInst = null,
    _server = null;

function getServer() {
  return _server;
}

function run(app) {
  _app = app;
  _app.servers.repl = exports;

  // If the unix socket still exists, delete it before listening to it.
  // Otherwise, you will get 'Error: listen EADDRINUSE'.
  if (fs.existsSync(SOCKET_PATH)) {
    fs.unlinkSync(SOCKET_PATH);
  }

  _server = net.createServer(function (socket) {
    _replInst = repl.start({
      input: socket,
      output: socket,
      prompt: PROMPT_PREFIX + '> '
    }).on('exit', function () {
      socket.end();
    });

    // Expose app to REPL.
    _replInst.context.app = app;
    _replInst.context.showRoutes = function () {
      var server = _app.servers.express.getServer();
      var routes = _(server.routes)
        .map(function (item) { return item; })
        .flatten()
        .map(function (route) {
          return route.method.toUpperCase() + ' ' + route.path;
        })
        .value();
      return routes;
    };

    // Expose more variables/functions to REPL.
    if (_.isFunction(_app.attachREPLContext)) {
      _app.attachREPLContext(_replInst.context);
    }
  }).listen(SOCKET_PATH, function () {
    debug(util.format('REPL listening...').cyan);
  });
}

// Public API
exports.getServer = getServer;
exports.run = run;
