const os = require('os');
const fs = require('fs');
const Store = require('electron-store').default;
const migrations = require('../migrations.js');

describe('migrations 0.1.0 (folders/audios_* -> flat tracks)', () => {
    let legacyPath;

    afterEach(() => {
        if (legacyPath && fs.existsSync(legacyPath)) fs.unlinkSync(legacyPath);
    });

    it("copies every folder's audios into a flat tracks array tagged Musique, without deleting the old folders/audios_* keys", () => {
        const name = 'test-migration-' + Date.now() + '-' + Math.random().toString(36).slice(2);
        const cwd = os.tmpdir();

        const legacy = new Store({name, cwd, projectVersion: '0.0.1', migrations});
        legacyPath = legacy.path;
        legacy.set('folders', [{id: 'f1', name: 'Rock', color: '#ff0000', createdAt: '2024-01-01', updatedAt: '2024-01-01'}]);
        legacy.set('audios_f1', [
            {id: 'a1', name: 'Track A', src: '/tmp/a1.mp3', color: '#00ff00', playing: false, createdAt: '2024-02-01', updatedAt: '2024-02-02'},
        ]);

        const migrated = new Store({name, cwd, projectVersion: '0.1.0', migrations});

        expect(migrated.get('tracks')).toEqual([
            {id: 'a1', name: 'Track A', src: '/tmp/a1.mp3', color: '#00ff00', tag: 'Musique', createdAt: '2024-02-01', updatedAt: '2024-02-02'},
        ]);
        expect(migrated.get('folders')).toEqual([{id: 'f1', name: 'Rock', color: '#ff0000', createdAt: '2024-01-01', updatedAt: '2024-01-01'}]);
        expect(migrated.get('audios_f1')).toEqual([
            {id: 'a1', name: 'Track A', src: '/tmp/a1.mp3', color: '#00ff00', playing: false, createdAt: '2024-02-01', updatedAt: '2024-02-02'},
        ]);
    });

    it('is additive: appends to any pre-existing tracks instead of overwriting them', () => {
        const name = 'test-migration-additive-' + Date.now() + '-' + Math.random().toString(36).slice(2);
        const cwd = os.tmpdir();

        const legacy = new Store({name, cwd, projectVersion: '0.0.1', migrations});
        legacyPath = legacy.path;
        legacy.set('tracks', [{id: 'existing', name: 'Existing Track', src: '/tmp/e.mp3', color: '#000000', tag: 'Disco'}]);
        legacy.set('folders', [{id: 'f1', name: 'Rock', color: '#ff0000'}]);
        legacy.set('audios_f1', [{id: 'a1', name: 'Track A', src: '/tmp/a1.mp3', color: '#00ff00', createdAt: '2024-02-01', updatedAt: '2024-02-02'}]);

        const migrated = new Store({name, cwd, projectVersion: '0.1.0', migrations});

        expect(migrated.get('tracks')).toEqual([
            {id: 'existing', name: 'Existing Track', src: '/tmp/e.mp3', color: '#000000', tag: 'Disco'},
            {id: 'a1', name: 'Track A', src: '/tmp/a1.mp3', color: '#00ff00', tag: 'Musique', createdAt: '2024-02-01', updatedAt: '2024-02-02'},
        ]);
    });

    it('leaves an empty tracks array when there are no folders at all', () => {
        const name = 'test-migration-empty-' + Date.now() + '-' + Math.random().toString(36).slice(2);
        const cwd = os.tmpdir();

        const legacy = new Store({name, cwd, projectVersion: '0.0.1', migrations});
        legacyPath = legacy.path;

        const migrated = new Store({name, cwd, projectVersion: '0.1.0', migrations});

        expect(migrated.get('tracks')).toEqual([]);
    });
});
