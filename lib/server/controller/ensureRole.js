/*
 * ultimate.server.controller.ensureRole
 */

'use strict';

exports = module.exports = function (role) {
  return function (req, res, next) {
    if (req.user || req.user.roles.indexOf(role) < 0) {
      return res.send(403);
    }
    next();
  };
};
