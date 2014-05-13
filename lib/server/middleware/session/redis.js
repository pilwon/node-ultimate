/*
 * ultimate.server.middleware.session.redis
 */

'use strict';

var url = require('url');

var _ = require('lodash'),
    connectRedis = require('connect-redis'),
    express = require('express');

/**
 * Attach redis session.
 *
 * @param {App} app Application.
 * @return {undefined}
 */
function attach(app) {
  var redisConfig = app.config.db.redis,
      redisUrl = url.parse(process.env.REDISTOGO_URL || process.env.REDISCLOUD_URL || '');

  if (redisUrl.href) {
    redisConfig.host = redisUrl.hostname;
    redisConfig.port = parseInt(redisUrl.port, 10);
    redisConfig.password = redisUrl.auth.split(':')[1];
  }

  // Override with Docker container link environment variable if detected.
  _.assign(redisConfig, _.reduce(process.env, function (result, val, key) {
    var matched = key.match(/^REDIS_PORT_(\d+)_TCP_ADDR$/);
    if (matched) {
      result.push({
        host: val,
        port: +matched[1]
      });
    }
    return result;
  }, [])[0]);

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
      host: redisConfig.host || 'localhost',
      port: redisConfig.port || 6379,
      pass: redisConfig.password || null,
      prefix: (app.config.session.store.redis.prefix || 'ultimate:sessions') + ':'
    })
  }));
}

// Public API
exports.attach = attach;
