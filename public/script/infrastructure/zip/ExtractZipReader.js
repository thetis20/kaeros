const path = require('path');
const extract = require('extract-zip');

class ExtractZipReader {
    /**
     * @param {string} zipPath
     * @param {string} destDir
     * @returns {Promise<void>}
     */
    async extract(zipPath, destDir) {
        await extract(zipPath, {dir: path.resolve(destDir)});
    }
}

module.exports = ExtractZipReader;
