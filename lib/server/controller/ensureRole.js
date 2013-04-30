/*
 * ultimate.server.controller.ensureRole
 */

'use strict';

var _ = require('lodash');

exports = module.exports = function (roles) {
  if (!_.isArray(roles)) { roles = []; }

  return function (req, res, next) {
    if (!req.isAuthenticated()) {
      return res.redirect('/login');
    }

    roles.forEach(function (role) {
      if (_.isString(role)) {
        if (!req.user || !_.contains(req.user.roles, role)) {
          return res.send(403);
        }
      }
    });

    next();
  };
};
