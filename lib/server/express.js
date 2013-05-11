/*
 * ultimate.server.express
 */

'use strict';

var path = require('path');

var _ = require('lodash'),
    connectFlash = require('connect-flash'),
    express = require('express'),
    expressValidator = require('express-validator'),
    express3Handlebars = require('express3-handlebars'),
    passport = require('passport');

var ultimateRequire = require('../require'),
    ultimateUUID = require('../util/uuid');

var _app = null,
    _server = null;

function _configure() {
  var hbs = express3Handlebars.create({
    defaultLayout: 'main',
    extname: '.html',
    helpers: ultimateRequire(_app.dir + '/views/_helpers'),
    layoutsDir: _app.dir + '/views/_layouts',
    partialsDir: _app.dir + '/views/_partials'
  });

  // All environments
  _server.configure(function () {
    _server.enable('case sensitive routing');
    _server.enable('strict routing');
    _server.engine('html', hbs.engine);
    _server.set('view engine', 'html');
    _server.set('views', _app.dir + '/views');
    _server.use(express.favicon(path.join(_app.dir, '..', _app.project.path.client, 'favicon.ico')));
    _server.use(express.logger('dev'));
    if (_.isFunction(_app.registerWinstonLogger)) {
      _app.registerWinstonLogger();
    }
    _server.use(express.compress());
    if (_.isObject(_app.config.cookie) && _.isString(_app.config.cookie.secret)) {
      _server.use(express.cookieParser(_app.config.cookie.secret));
    } else {
      _server.use(express.cookieParser());
    }
    _server.use(express.bodyParser());
    _server.use(expressValidator);
    _server.use(connectFlash());

    _app.attachMiddlewares();
  });

  // Development environment
  _server.configure('development', function () {
    _server.use('/css', express.static(path.join(_app.dir, '..', _app.project.path.temp, 'css')));
    _server.use(express.static(path.join(_app.dir, '..', _app.project.path.client)));
    _server.use(express.errorHandler({
      dumpExceptions: true,
      showStack: true
    }));
  });

  // Production environment
  _server.configure('heroku', function () {
    var maxAge = 1000 * 60 * 60 * 24 * 30;  // 1 month
    // var maxAge = 1000 * 60 * 60 * 24 * 365.25;  // 1 year
    _server.use('/components', express.static(path.join(_app.dir, '..', _app.project.path.client, 'components'), { maxAge: maxAge }));
    _server.use(express.static(path.join(_app.dir, '..', _app.project.path.dist), { maxAge: maxAge }));
    _server.use(express.errorHandler());
  });

  // Production environment
  _server.configure('production', function () {
    var maxAge = 1000 * 60 * 60 * 24 * 30;  // 1 month
    // var maxAge = 1000 * 60 * 60 * 24 * 365.25;  // 1 year
    _server.use('/components', express.static(path.join(_app.dir, '..', _app.project.path.client, 'components'), { maxAge: maxAge }));
    _server.use(express.static(path.join(_app.dir, '..', _app.project.path.dist), { maxAge: maxAge }));
    _server.use(express.errorHandler());
  });

  // Register routes
  _app.routes.register(_app);

  // Register passport serializers
  passport.serializeUser(function (user, done) {
    var createAccessToken = function () {
      var token = ultimateUUID({ length: 30, dash: false });
      _app.models.User.findOne({
        accessToken: token
      }, function (err, existingUser) {
        if (err) { return done(err); }
        if (existingUser) {
          createAccessToken();
        } else {
          user.set('accessToken', token);
          user.save(function (err) {
            if (err) { return done(err); }
            return done(null, user.get('accessToken'));
          });
        }
      });
    };
    if (user._id) {
      createAccessToken();
    }
  });
  passport.deserializeUser(function (token, done) {
    _app.models.User.findOne({
      accessToken: token
    }, function (err, user) {
      done(err, user);
    });
  });

  _server.configure(function () {
    _server.use(_server.router);
    if (_.isFunction(_app.registerWinstonErrorLogger)) {
      _app.registerWinstonErrorLogger();
    }
  });
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
