/*
 * ultimate.server.middleware.session._use
 */

'use strict';

var _ = require('lodash');

// Selects the first store, if multiple stores exist
// in "config.sesison.store" but "config.session._use"
// is not specified.
exports = module.exports = function (config, storeIds) {
  var store = null;
  storeIds.forEach(function (storeId) {
    if (_.has(config.session.store, storeId) &&
        (!store || config.session._use === storeId)) {
      store = storeId;
    }
  });
  return store;
};
