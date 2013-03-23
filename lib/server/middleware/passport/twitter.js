/*
 * ultimate.server.middleware.passport.twitter
 */

'use strict';

var _ = require('lodash'),
    passport = require('passport');

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
  var TwitterStrategy = require('passport-twitter').Strategy;

  passport.use(new TwitterStrategy({
    consumerKey: twitterConfig.key,        // CONSUMER_KEY
    consumerSecret: twitterConfig.secret,  // CONSUMER_SECRET
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
  _app = app;

  if (!_.isObject(_app.config.auth) ||
      !_.isObject(_app.config.auth.twitter) ||
      !_.isString(_app.config.auth.twitter.key)) {
    throw new Error('Missing string in config: auth.twitter.key');
  }

  if (!_.isObject(_app.config.auth) ||
      !_.isObject(_app.config.auth.twitter) ||
      !_.isString(_app.config.auth.twitter.secret)) {
    throw new Error('Missing string in config: auth.twitter.secret');
  }

  _attachStrategy(_app.config.auth.twitter, _app.config.url);
}

// Public API
exports.attach = attach;
