import '@testing-library/jest-dom';
import {webcrypto} from 'node:crypto';

if (!global.crypto || typeof global.crypto.getRandomValues !== 'function') {
    global.crypto = webcrypto;
}
