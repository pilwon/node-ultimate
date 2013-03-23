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

var ultimateRequire = require('../require');

// Private variables
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
    _server.set('port', process.env.PORT || _app.project.server.port);
    _server.enable('case sensitive routing');
    _server.enable('strict routing');
    _server.engine('html', hbs.engine);
    _server.set('view engine', 'html');
    _server.set('views', _app.dir + '/views');
    _server.use(express.favicon());
    _server.use(express.logger('dev'));
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
    _server.use(express.static(path.join(_app.dir, '..', _app.project.path.temp)));
    _server.use(express.static(path.join(_app.dir, '..', _app.project.path.client)));
    _server.use(express.errorHandler({
      dumpExceptions: true,
      showStack: true
    }));
  });

  // Production environment
  _server.configure('production', function () {
    _server.use(express.static(path.join(_app.dir, '..', _app.project.path.temp), { maxAge: 31557600000 /* 1yr */ }));
    _server.use(express.static(path.join(_app.dir, '..', _app.project.path.client), { maxAge: 31557600000 /* 1yr */ }));
    _server.use(express.errorHandler());
  });

  // Register routes
  _app.routes.register(_app);

  // Register passport serializers
  passport.serializeUser(function (user, done) {
    var createAccessToken = function () {
      var token = user.generateRandomToken();
      _app.models.User.findOne({
        accessToken: token
      }, function (err, existingUser) {
        if (err) { return done(err); }
        if (existingUser) {
          createAccessToken(); // Run the function again - the token has to be unique!
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
