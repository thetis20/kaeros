const os = require('os');
const path = require('path');
const fs = require('fs');

class Store {
    constructor(options = {}) {
        this.name = options.name || 'config';
        this.cwd = options.cwd || os.homedir();
        this.path = path.join(this.cwd, `${this.name}.json`);
        this.data = {};
        this.migrations = options.migrations || {};

        if (fs.existsSync(this.path)) {
            try {
                this.data = JSON.parse(fs.readFileSync(this.path, 'utf8'));
            } catch (e) {
                this.data = {};
            }
        }

        this._runMigrations();
    }

    _runMigrations() {
        // Placeholder for migrations support
    }

    get(key) {
        return this.data[key];
    }

    set(key, value) {
        this.data[key] = value;
        this._save();
    }

    delete(key) {
        delete this.data[key];
        this._save();
    }

    appendToArray(key, value) {
        if (!Array.isArray(this.data[key])) {
            this.data[key] = [];
        }
        this.data[key].push(value);
        this._save();
    }

    _save() {
        fs.mkdirSync(path.dirname(this.path), { recursive: true });
        fs.writeFileSync(this.path, JSON.stringify(this.data, null, 2));
    }
}

module.exports = { default: Store };
