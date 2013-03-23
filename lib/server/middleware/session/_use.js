/*
 * ultimate.server.middleware.session._use
 */

'use strict';

var _ = require('lodash');

exports = module.exports = function (config, storeIds) {
  // prefers the first store, if multiple stores exist in config
  // but "store._use" is not specified.
  var store = null;
  storeIds.forEach(function (storeId) {
    if (_.has(config.session.store, storeId) &&
        (!store || config.session.store._use === storeId)) {
      store = storeId;
    }
  });
  return store;
};
