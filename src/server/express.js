/*
 * ultimate.server.express
 */

'use strict';

var path = require('path');

var express = require('express'),
    express3Handlebars = require('express3-handlebars'),
    ultimate = require('../..');

var _app = null,
    _server = null;

function _configure() {
  var hbs = express3Handlebars.create({
    defaultLayout: 'main',
    extname: '.html',
    helpers: ultimate.require(_app.dir + '/views/_helpers'),
    layoutsDir: _app.dir + '/views/_layouts',
    partialsDir: _app.dir + '/views/_partials'
  });

  // All environments
  _server.configure(function () {
    _server.set('port', process.env.PORT || _app.project.server.port);
    _server.engine('html', hbs.engine);
    _server.set('view engine', 'html');
    _server.set('views', _app.dir + '/views');
    _server.use(express.favicon());
    _server.use(express.logger('dev'));
    _server.use(express.static(path.join(_app.dir, '..', _app.project.path.temp)));
    _server.use(express.static(path.join(_app.dir, '..', _app.project.path.client)));
    _server.use(express.bodyParser());
    _server.use(express.methodOverride());
    _server.use(_server.router);
  });

  // Development environment
  _server.configure('development', function () {
    _server.use(express.errorHandler());
  });

  // Production environment
  _server.configure('production', function () {
    _server.use(express.errorHandler());
  });

  // Register routes
  _app.routes.register(_app);
}

function getServer() {
  return _server;
}

function run(app) {
  _app = app;
  _app.servers.express = exports;
  _server = express();
  _configure();
}

// Public API
exports.getServer = getServer;
exports.run = run;
