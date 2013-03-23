/*
 * ultimate.server.middleware.session.mongo
 */

'use strict';

var _ = require('lodash'),
    connectMongo = require('connect-mongo'),
    express = require('express');

/**
 * Attach mongo session.
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
      !_.isObject(app.config.session.store.mongo)) {
    throw new Error('Missing object in config: session.store.mongo');
  }

  // Middleware
  app.servers.express.getServer().use(express.session({
    key: app.config.session.key,
    secret: app.config.session.secret,
    store: new (connectMongo(express))({
      host: app.config.session.store.mongo.host || 'localhost',
      port: app.config.session.store.mongo.port || 27017,
      username: app.config.session.store.mongo.username || null,
      password: app.config.session.store.mongo.password || null,
      db: app.config.session.store.mongo.db || 'ultimate',
      collection: app.config.session.store.mongo.collection || 'sessions',
      stringify: false
    })
  }));
}

// Public API
exports.attach = attach;
