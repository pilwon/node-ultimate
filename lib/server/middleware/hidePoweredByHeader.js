/*
 * ultimate.server.middleware.hidePoweredByHeader
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
    res.removeHeader('X-Powered-By');
    next();
  });
}

// Public API
exports.attach = attach;
