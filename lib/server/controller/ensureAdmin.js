/*
 * ultimate.server.controller.ensureAdmin
 */

'use strict';

var _ = require('lodash');

exports = module.exports = function (req, res, next) {
  if (!req.isAuthenticated()) {
    return res.redirect('/login');
  }

  if (!req.user || !_.contains(req.user.roles, 'admin')) {
    return res.send(403);
  }

  next();
};
