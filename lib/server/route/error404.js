/*
 * ultimate.server.route.error404
 */

'use strict';

exports.register = function (expressServer) {
  expressServer.get('*', function (req, res) {
    res.status(404);
    res.render('_errors/404', {
      layout: false,
      status: 404,
      url: req.url
    });
  });
};
