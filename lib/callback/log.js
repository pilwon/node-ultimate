/*
 * ultimate.callback.log
 */

'use strict';

exports = module.exports = function (err) {
  if (err) { return console.error(err); }
  var args = Array.prototype.slice.call(arguments, 0);
  console.log(JSON.stringify(args.slice(1), null, 2));
};
