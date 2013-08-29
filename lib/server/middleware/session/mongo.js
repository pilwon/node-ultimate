/*
 * ultimate.server.middleware.session.mongo
 */

'use strict';

var url = require('url');

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
  var mongoConfig = app.config.db.mongo,
      mongoUrl = url.parse(process.env.MONGOHQ_URL || process.env.MONGOLAB_URI || '');

  if (mongoUrl.href) {
    mongoConfig.host = mongoUrl.hostname;
    mongoConfig.port = parseInt(mongoUrl.port, 10);
    mongoConfig.username = mongoUrl.auth.split(':')[0];
    mongoConfig.password = mongoUrl.auth.split(':')[1];
    mongoConfig.db = mongoUrl.pathname.slice(1);
  }

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
      host: mongoConfig.host || 'localhost',
      port: mongoConfig.port || 27017,
      username: mongoConfig.username || null,
      password: mongoConfig.password || null,
      db: mongoConfig.db || 'ultimate-seed',
      collection: app.config.session.store.mongo.collection || 'sessions'
    })
  }));
}

// Public API
exports.attach = attach;
