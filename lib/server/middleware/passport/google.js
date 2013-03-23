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
  passport.use(new passportGoogleOAuth.OAuth2Strategy({
    clientID: googleConfig.key,          // CLIENT_ID
    clientSecret: googleConfig.secret,  // CLIENT_SECRET
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
  _app = app;

  if (!_.isObject(_app.config.auth) ||
      !_.isObject(_app.config.auth.google) ||
      !_.isString(_app.config.auth.google.key)) {
    throw new Error('Missing string in config: auth.google.key');
  }

  if (!_.isObject(_app.config.auth) ||
      !_.isObject(_app.config.auth.google) ||
      !_.isString(_app.config.auth.google.secret)) {
    throw new Error('Missing string in config: auth.google.secret');
  }

  _attachStrategy(_app.config.auth.google, _app.config.url);
}

// Public API
exports.attach = attach;
