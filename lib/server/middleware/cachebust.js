/*
 * ultimate.server.middleware.cachebust
 */

'use strict';

var fs = require('fs'),
    path = require('path');

var _ = require('lodash');

var _app = null,
    _cachebusts = {},
    _fileRead = false;

function _getHash(cb) {
  if (_fileRead) {
    return cb(null, _cachebusts);
  }
  fs.readFile(path.join(_app.dir, '../.cachebust'), 'utf8', function (err, data) {
    _fileRead = true;
    if (err) {
      console.error(err.message);
    } else {
      try {
        _cachebusts = JSON.parse(data);
      } catch (e) {}
    }
    return cb(null, _cachebusts);
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
    _getHash(function (err, cachebusts) {
      if (err) { return next(err); }
      _.each(cachebusts, function (cachebust, filepath) {
        var matched = filepath.match(/^server\/views\/_layouts\/([^./]+)\.hbs$/);
        if (matched) {
          res.locals['$$' + matched[1] + '$$'] = cachebust;
        }
      });
      next();
    });
  });
}

// Public API
exports.attach = attach;
