/*
 * ultimate.server.route.removeTrailingSlash
 */

'use strict';

exports.register = function (expressServer) {
  expressServer.get('*', function (req, res, next) {
    var redirectUrl = req.url
      .replace(/(\/+)/g, '/')
      .replace(/\/((?:\?.*)?)$/, '$1');
    if (req.url !== redirectUrl) {
      return res.redirect(302, redirectUrl);
    }
    next();
  });
};
