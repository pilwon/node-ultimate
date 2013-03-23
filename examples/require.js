/*
 * examples/require.js
 */

var ultimate = require('..');

// ultimate.require

console.log('ultimate.require ./**/* (default)'.bold);
console.log(ultimate.require());

console.log('ultimate.require ../**/*'.bold);
console.log(ultimate.require('..'));

console.log('ultimate.require ../**/* (non-recursive)'.bold);
console.log(ultimate.require('..', false));
