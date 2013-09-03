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

  if (!_app.project.server.repl) {
    return;
  } else if (process.platform.match(/^win/)) {
    return _app.logger.debug('repl is not supported on Windows.'.yellow);
  }

  _app.servers.repl = exports;

  // If the unix socket still exists, delete it before listening to it.
  // Otherwise, you will get 'Error: listen EADDRINUSE'.
  var socketFile = util.format('%s.%d', SOCKET_PATH, process.pid);
  if (fs.existsSync(socketFile)) {
    fs.unlinkSync(socketFile);
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
  }).listen(socketFile, function () {
    debug(util.format('REPL listening...').cyan);
  });
}

// Public API
exports.getServer = getServer;
exports.run = run;
