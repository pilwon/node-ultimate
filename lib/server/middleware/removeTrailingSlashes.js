/*
 * ultimate.server.middleware.removeTrailingSlashes
 */

'use strict';

/**
 * Attach middleware.
 *
 * @param {App} app Application.
 * @return {undefined}
 */
function attach(app) {
  app.servers.express.getServer().use(function (req, res, next) {
    var redirectUrl = req.url.replace(/(\/+)/g, '/')
                             .replace(/\/((?:\?.*)?)$/, '$1')
                             .replace(/^([^\/])/, '/$1');
    if (req.url !== redirectUrl && req.url !== '/') {
      return res.redirect(302, redirectUrl);
    }
    next();
  });
}

// Public API
exports.attach = attach;
