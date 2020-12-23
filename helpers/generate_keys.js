const crypto = require('crypto');

const keys1 = crypto.randomBytes(32).toString('hex');
const keys2 = crypto.randomBytes(32).toString('hex');
console.table({ keys1, keys2 });
