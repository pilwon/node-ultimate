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

  // Middleware
  app.servers.express.getServer().use(express.session({
    key: app.config.session.key,
    secret: app.config.session.secret,
    store: new (connectRedis(express))({
      client: redis.createClient(),
      host: app.config.session.store.redis.host || 'localhost',
      port: app.config.session.store.redis.port || 6379,
      pass: app.config.session.store.redis.password || null,
      db: app.config.session.store.redis.db || 'ultimate',
      prefix: (app.config.session.store.redis.prefix || 'sess') + ':',
    })
  }));
}

// Public API
exports.attach = attach;
