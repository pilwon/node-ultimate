/*
 * ultimate.server.middleware.passport.google
 */

'use strict';

var _ = require('lodash'),
    passport = require('passport'),
    passportGoogleOAuth = require('passport-google-oauth');

var _app = null;

/**
 * Attach Google strategy.
 *
 * @private
 * @param {object} googleConfig Google config object.
 * @param {string} baseUrl Base URL.
 * @return {undefined}
 */
function _attachStrategy(googleConfig, baseUrl) {
  if (!_.isString(googleConfig.clientId)) {
    throw new Error('Missing string in config: api.google.clientId');
  }

  if (!_.isString(googleConfig.clientSecret)) {
    throw new Error('Missing string in config: api.google.clientSecret');
  }

  passport.use(new passportGoogleOAuth.OAuth2Strategy({
    clientID: googleConfig.clientId,
    clientSecret: googleConfig.clientSecret,
    callbackURL: baseUrl + '/auth/google/callback'
  }, function (accessToken, refreshToken, profile, done) {
    _app.models.User.findOrCreateGoogle(accessToken, refreshToken, profile, done);
  }));
}

/**
 * Attach passport middleware.
 *
 * @param {App} app Application.
 * @return {undefined}
 */
function attach(app) {
  if (!_.isObject(app.config) ||
      !_.isObject(app.config.api) ||
      !_.isObject(app.config.api.google)) {
    throw new Error('Missing string in config: api.google');
  }

  _app = app;
  _attachStrategy(_app.config.api.google, _app.config.url);
}

// Public API
exports.attach = attach;
