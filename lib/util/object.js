/*
 * ultimate.util.object
 */

'use strict';

var _ = require('lodash');



function expandDot(singleLevelObject) {
  // TODO
  return singleLevelObject;
}


/**
 * It converts nested object into a flattened object.
 * e.g.
 * from
 * {
 *   'a': {
 *     'b': [1,2,3],
 *     'c': {
 *       'd': 1,
 *       'e': 2
 *     }
 *   }
 * }
 * to
 * {
 *   'a.b': [1,2,3],
 *   'a.c.d': 1,
 *   'a.c.e': 2
 * }
 * @param  {object} multiLevelObject Object with multiple nestings.
 * @return {object} flattened object.
 */
function flattenDot(multiLevelObject) {
  return _.reduce(multiLevelObject, function (result, val, key) {
    var flatObject;
    if (_.isPlainObject(val)) {
      flatObject = flattenDot(val);
      _.forEach(flatObject, function (flatVal, flatKey) {
        result[key + '.' + flatKey] = flatVal;
      });
      delete result[key];
    } else {
      flatObject = val;
      result[key] = flatObject;
    }
    return result;
  }, {});
}


// Public API
exports.expandDot = expandDot;
exports.flattenDot = flattenDot;
