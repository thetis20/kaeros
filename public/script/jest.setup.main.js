const {webcrypto} = require('crypto');

if (!global.crypto || typeof global.crypto.getRandomValues !== 'function') {
    global.crypto = webcrypto;
}
