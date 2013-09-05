/*
 * ultimate.server.middleware.cachebust
 */

'use strict';

var fs = require('fs'),
    path = require('path');

var _app = null,
    _cachebust = null;

function _getHash(cb) {
  if (_cachebust) {
    return cb(null, _cachebust);
  }
  fs.readFile(path.join(_app.dir, '../.cachebust'), 'utf8', function (err, data) {
    if (err) { return cb(err); }
    var json = {};
    try {
      json = JSON.parse(data);
    } catch (e) {}
    _cachebust = json[
      path.join(
        _app.project.path[
        process.env.NODE_ENV === 'development' ? 'temp' : 'dist'
      ],
      'index.html'
      )
    ];
    return cb(null, _cachebust);
  });
}

/**
 * Attach middleware.
 *
 * @param {App} app Application.
 * @return {undefined}
 */
function attach(app) {
  _app = app;
  app.servers.express.getServer().use(function (req, res, next) {
    _getHash(function (err, cachebust) {
      if (err) { return next(err); }
      res.locals.cachebust = cachebust;
      next();
    });
  });
}

// Public API
exports.attach = attach;
