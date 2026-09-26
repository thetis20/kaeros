const fs = require('fs');

class CheckMediaFilesUseCase {

    /**
     * @param {{id: string, kind: string, name: string, src: string}[]} items
     * @returns {Promise<Array<{id: string, kind: string, name: string, src: string, code: string}>>}
     */
    async execute(items) {
        return Promise.all(items.map((item) => this._check(item)));
    }

    async _check(item) {
        const code = await this._codeFor(item.src);
        return {...item, code};
    }

    async _codeFor(src) {
        if (!src) {
            return 'no-source';
        }

        try {
            await fs.promises.access(src, fs.constants.R_OK);
        } catch (err) {
            return err.code === 'ENOENT' ? 'missing' : 'unreadable';
        }

        try {
            const stat = await fs.promises.stat(src);
            if (!stat.isFile()) {
                return 'not-a-file';
            }
            if (stat.size === 0) {
                return 'empty';
            }
            return 'ok';
        } catch (err) {
            return err.code === 'ENOENT' ? 'missing' : 'unreadable';
        }
    }
}

module.exports = CheckMediaFilesUseCase;