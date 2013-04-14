/*
 * ultimate.server.middleware.passport.twitter
 */

'use strict';

var _ = require('lodash'),
    passport = require('passport'),
    passportTwitter = require('passport-twitter');

var _app = null;

/**
 * Attach Twitter strategy.
 *
 * @private
 * @param {object} twitterConfig Twitter config object.
 * @param {string} baseUrl Base URL.
 * @return {undefined}
 */
function _attachStrategy(twitterConfig, baseUrl) {
  if (!_.isString(twitterConfig.consumerKey)) {
    throw new Error('Missing string in config: api.twitter.consumerKey');
  }

  if (!_.isString(twitterConfig.consumerSecret)) {
    throw new Error('Missing string in config: api.twitter.consumerSecret');
  }

  passport.use(new passportTwitter.Strategy({
    consumerKey: twitterConfig.consumerKey,
    consumerSecret: twitterConfig.consumerSecret,
    callbackURL: baseUrl + '/auth/twitter/callback'
  }, function (token, tokenSecret, profile, done) {
    _app.models.User.findOrCreateTwitter(token, tokenSecret, profile, done);
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
      !_.isObject(app.config.api.twitter)) {
    throw new Error('Missing string in config: api.twitter');
  }

  _app = app;
  _attachStrategy(_app.config.api.twitter, _app.config.url);
}

// Public API
exports.attach = attach;
