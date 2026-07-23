const {webcrypto} = require('crypto');
const v8 = require('v8');

if (!global.crypto || typeof global.crypto.getRandomValues !== 'function') {
    global.crypto = webcrypto;
}

if (typeof global.structuredClone !== 'function') {
    // Assumes JSON-shaped values (this codebase's store data always is); v8
    // serialize/deserialize throws on functions and drops class prototypes.
    global.structuredClone = (value) => v8.deserialize(v8.serialize(value));
}
