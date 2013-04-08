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

  var vcapMongo = {};
  if (process.env.VCAP_SERVICES) {
    vcapMongo = JSON.parse(process.env.VCAP_SERVICES);
    vcapMongo = vcapMongo['mongodb-1.8'][0].credentials;
  }

  // Middleware
  app.servers.express.getServer().use(express.session({
    key: app.config.session.key,
    secret: app.config.session.secret,
    store: new (connectMongo(express))({
      host: vcapMongo.hostname || app.config.db.mongo.host || 'localhost',
      port: vcapMongo.port || app.config.db.mongo.port || 27017,
      username: vcapMongo.username || app.config.db.mongo.username || null,
      password: vcapMongo.password || app.config.db.mongo.password || null,
      db: vcapMongo.db || app.config.db.mongo.db || 'ultimate',
      collection: app.config.session.store.mongo.collection || 'sessions',
      stringify: false
    })
  }));
}

// Public API
exports.attach = attach;
