/*
 * ultimate.db.mongoose.getClient
 */

'use strict';

exports = module.exports = function () {
  return require('./connect')._client;
};
