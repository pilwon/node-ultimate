/*
 * ultimate.server.middleware.cachebust
 */

'use strict';

var fs = require('fs'),
    path = require('path');

var _cachebust = null;

function _getHash(app) {
  if (_cachebust) {
    return _cachebust;
  }
  try {
    _cachebust = JSON.parse(fs.readFileSync(path.join(app.dir, '../.cachebust')))[
      path.join(
        app.project.path[
        process.env.NODE_ENV === 'development' ? 'temp' : 'dist'
      ],
      'index.html'
      )
    ];
  } catch (e) {}
  return _cachebust;
}

/**
 * Attach middleware.
 *
 * @param {App} app Application.
 * @return {undefined}
 */
function attach(app) {
  app.servers.express.getServer().use(function (req, res, next) {
    res.locals.cachebust = _getHash(app);
    next();
  });
}

// Public API
exports.attach = attach;
