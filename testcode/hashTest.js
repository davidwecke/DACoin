const blake3 = require('blake3');

hashString = Date.now() + 0 + ['david', 'alex', '10'].toString();

console.log(blake3.hash(hashString).toString('hex'));