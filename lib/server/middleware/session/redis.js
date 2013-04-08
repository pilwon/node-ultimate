/*
 * ultimate.server.middleware.session.redis
 */

'use strict';

var _ = require('lodash'),
    connectRedis = require('connect-redis'),
    express = require('express'),
    redis = require('redis');

/**
 * Attach redis session.
 *
 * @param {App} app Application.
 * @return {undefined}
 */
function attach(app) {
  if (!_.isObject(app.config.session) ||
      !_.isString(app.config.session.key)) {
    throw new Error('Missing string in config: session.key');
  }
  if (!_.isObject(app.config.session) ||
      !_.isString(app.config.session.secret)) {
    throw new Error('Missing string in config: session.secret');
  }
  if (!_.isObject(app.config.session) ||
      !_.isObject(app.config.session.store) ||
      !_.isObject(app.config.session.store.redis)) {
    throw new Error('Missing object in config: session.store.redis');
  }

  var vcapRedis = {};
  if (process.env.VCAP_SERVICES) {
    vcapRedis = JSON.parse(process.env.VCAP_SERVICES);
    vcapRedis = vcapRedis['redis-2.2'][0].credentials;
  }

  // Middleware
  app.servers.express.getServer().use(express.session({
    key: app.config.session.key,
    secret: app.config.session.secret,
    store: new (connectRedis(express))({
      host: vcapRedis.hostname || app.config.db.redis.host || 'localhost',
      port: vcapRedis.port || app.config.db.redis.port || 6379,
      pass: vcapRedis.password || app.config.db.redis.password || null,
      prefix: (app.config.session.store.redis.prefix || 'ultimate:sessions') + ':'
    })
  }));
}

// Public API
exports.attach = attach;
