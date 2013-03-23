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
  passport.use(new passportFacebook.Strategy({
    clientID: facebookConfig.id,          // APP_ID
    clientSecret: facebookConfig.secret,  // APP_SECRET
    callbackURL: baseUrl + '/auth/facebook/callback'
  }, function (accessToken, refreshToken, profile, done) {
    _app.models.User.findOrCreateFacebook(accessToken, refreshToken, profile, function (err, user) {
      // console.log(user);
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

  if (!_.isObject(_app.config.auth) ||
      !_.isObject(_app.config.auth.facebook) ||
      !_.isString(_app.config.auth.facebook.id)) {
    throw new Error('Missing string in config: auth.facebook.id');
  }

  if (!_.isObject(_app.config.auth) ||
      !_.isObject(_app.config.auth.facebook) ||
      !_.isString(_app.config.auth.facebook.secret)) {
    throw new Error('Missing string in config: auth.facebook.secret');
  }

  _attachStrategy(_app.config.auth.facebook, _app.config.url);
}

// Public API
exports.attach = attach;
