/*
 * ultimate.server.controller.ensureUser
 */

'use strict';

exports = module.exports = function (req, res, next) {
  if (!req.isAuthenticated()) {
    return res.redirect('/login');
  }

  next();
};
