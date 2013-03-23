/*
 * examples/fs.js
 */

var ultimate = require('..');

// ultimate.fs.glob

//...

// ultimate.fs.globSync

console.log('ultimate.fs.globSync ./**/* (default)'.bold);
console.log(ultimate.fs.globSync());

console.log('ultimate.fs.globSync ../**/*'.bold);
console.log(ultimate.fs.globSync('../**/*'));

console.log('ultimate.fs.globSync /tmp/**/*'.bold);
console.log(ultimate.fs.globSync('/tmp/**/*'));
