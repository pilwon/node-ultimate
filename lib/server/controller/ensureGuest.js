/*
 * ultimate.server.controller.ensureGuest
 */

'use strict';

exports = module.exports = function (req, res, next) {
  if (req.isAuthenticated()) {
    return res.redirect('/');
  }

  next();
};
