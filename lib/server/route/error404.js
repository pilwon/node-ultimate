/*
 * ultimate.server.route.error404
 */

'use strict';

var fs = require('fs'),
    path = require('path');

exports.register = function (expressServer, app) {
  expressServer.get('*', function (req, res) {
    var clientDir;
    if (process.env.NODE_ENV === 'development') {
      clientDir = app.project.path.client;
    } else {
      clientDir = app.project.path.dist;
    }

    fs.readFile(path.join(app.dir, '..', clientDir, '404.html'), 'utf8', function (err, html) {
      res.send(404, (err ? '<h2>Page not found.</h2>' : html));
    });
  });
};
