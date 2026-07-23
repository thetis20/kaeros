const {webcrypto} = require('crypto');
const v8 = require('v8');

if (!global.crypto || typeof global.crypto.getRandomValues !== 'function') {
    global.crypto = webcrypto;
}

if (typeof global.structuredClone !== 'function') {
    global.structuredClone = (value) => v8.deserialize(v8.serialize(value));
}
