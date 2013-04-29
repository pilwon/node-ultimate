/*
 * ultimate.server.middleware.passport.facebook
 */

'use strict';

var _ = require('lodash'),
    passport = require('passport'),
    passportFacebook = require('passport-facebook');

var _app = null;

/**
 * Attach Facebook strategy.
 *
 * @private
 * @param {object} facebookConfig Facebook config object.
 * @param {string} baseUrl Base URL.
 * @return {undefined}
 */
function _attachStrategy(facebookConfig, baseUrl) {
  if (!_.isString(facebookConfig.appId)) {
    throw new Error('Missing string in config: api.facebook.appId');
  }

  if (!_.isString(facebookConfig.appSecret)) {
    throw new Error('Missing string in config: api.facebook.appSecret');
  }

  passport.use(new passportFacebook.Strategy({
    clientID: facebookConfig.appId,
    clientSecret: facebookConfig.appSecret,
    callbackURL: baseUrl + '/auth/facebook/callback'
  }, function (accessToken, refreshToken, profile, done) {
    _app.models.User.findOrCreateFacebook(accessToken, refreshToken, profile, function (err, user) {
      return done(null, user);
    });
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

  if (!_.isObject(app.config) ||
      !_.isObject(app.config.api) ||
      !_.isObject(app.config.api.facebook)) {
    throw new Error('Missing string in config: api.facebook');
  }

  _attachStrategy(_app.config.api.facebook, _app.config.url);
}

// Public API
exports.attach = attach;
