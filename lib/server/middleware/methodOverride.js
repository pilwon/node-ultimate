/*
 * ultimate.server.middleware.methodOverride
 */

'use strict';

var express = require('express');

var OVERRIDE_KEY = '_method';

/**
 * Attach middleware.
 *
 * Support method override middleware for querystring as well for ease of debugging.
 *
 * @param {App} app Application.
 * @return {undefined}
 */
function attach(app) {
  app.servers.express.getServer().use(express.methodOverride(OVERRIDE_KEY));
  app.servers.express.getServer().use(function (req, res, next) {
    req.originalMethod = req.originalMethod || req.method;
    if (req.query && OVERRIDE_KEY in req.query) {
      req.method = req.query[OVERRIDE_KEY].toUpperCase();
      delete req.query[OVERRIDE_KEY];
    }
    next();
  });
}

// Public API
exports.attach = attach;
