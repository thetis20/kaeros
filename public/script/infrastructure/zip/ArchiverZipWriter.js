const fs = require('fs');
const archiver = require('archiver');

class ArchiverZipWriter {
    /**
     * Writes a zip (store, no recompression) to destPath, atomically via a .tmp file.
     * @param {string} destPath
     * @param {{json: {name: string, content: string}, files: {source: string, name: string}[]}} entries
     * @returns {Promise<void>}
     */
    async write(destPath, {json, files}) {
        const tmpPath = `${destPath}.tmp`;
        try {
            await new Promise((resolve, reject) => {
                const output = fs.createWriteStream(tmpPath);
                const archive = archiver('zip', {zlib: {level: 0}, store: true});
                output.on('close', resolve);
                output.on('error', reject);
                archive.on('error', reject);
                archive.pipe(output);
                archive.append(json.content, {name: json.name});
                for (const file of files) {
                    archive.file(file.source, {name: file.name});
                }
                archive.finalize().catch(reject);
            });
            await fs.promises.rename(tmpPath, destPath);
        } catch (err) {
            await fs.promises.rm(tmpPath, {force: true});
            throw err;
        }
    }
}

module.exports = ArchiverZipWriter;
