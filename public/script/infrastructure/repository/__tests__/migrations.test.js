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

describe('migrations 0.3.0 (tag string -> tags[] + seed Tag store)', () => {
    let legacyPath;

    afterEach(() => {
        if (legacyPath && fs.existsSync(legacyPath)) fs.unlinkSync(legacyPath);
    });

    it('seeds the 3 fixed tags with their historical colors when the tag store is empty', () => {
        const name = 'test-migration-030-seed-' + Date.now() + '-' + Math.random().toString(36).slice(2);
        const cwd = os.tmpdir();

        const legacy = new Store({name, cwd, projectVersion: '0.1.0', migrations});
        legacyPath = legacy.path;

        const migrated = new Store({name, cwd, projectVersion: '0.3.0', migrations});

        const tags = migrated.get('tags');
        expect(tags).toHaveLength(3);
        expect(tags.map(t => t.name)).toEqual(['Musique', 'Bruitage', 'Disco']);
        expect(tags.map(t => t.color)).toEqual(['#4C6EFF', '#F76707', '#AE3EC9']);
        tags.forEach(t => expect(t.id).toEqual(expect.any(String)));
    });

    it('does not duplicate fixed tags if they already exist (idempotent)', () => {
        const name = 'test-migration-030-idempotent-' + Date.now() + '-' + Math.random().toString(36).slice(2);
        const cwd = os.tmpdir();

        const legacy = new Store({name, cwd, projectVersion: '0.1.0', migrations});
        legacyPath = legacy.path;
        legacy.set('tags', [{id: 'existing-musique', name: 'Musique', color: '#4C6EFF'}]);

        const migrated = new Store({name, cwd, projectVersion: '0.3.0', migrations});

        const tags = migrated.get('tags');
        expect(tags.filter(t => t.name === 'Musique')).toHaveLength(1);
        expect(tags.find(t => t.name === 'Musique').id).toBe('existing-musique');
        expect(tags.map(t => t.name).sort()).toEqual(['Bruitage', 'Disco', 'Musique']);
    });

    it("rewrites each track's tag string into a tags id array, dropping the tag and color fields", () => {
        const name = 'test-migration-030-rewrite-' + Date.now() + '-' + Math.random().toString(36).slice(2);
        const cwd = os.tmpdir();

        const legacy = new Store({name, cwd, projectVersion: '0.1.0', migrations});
        legacyPath = legacy.path;
        legacy.set('tracks', [
            {id: 't1', name: 'Track One', src: '/tmp/t1.mp3', color: '#4C6EFF', tag: 'Musique', createdAt: '2024-01-01', updatedAt: '2024-01-01'},
            {id: 't2', name: 'Track Two', src: '/tmp/t2.mp3', color: '#F76707', tag: 'Bruitage'},
        ]);

        const migrated = new Store({name, cwd, projectVersion: '0.3.0', migrations});

        const tags = migrated.get('tags');
        const musiqueId = tags.find(t => t.name === 'Musique').id;
        const bruitageId = tags.find(t => t.name === 'Bruitage').id;
        const tracks = migrated.get('tracks');

        expect(tracks.find(t => t.id === 't1')).toEqual({id: 't1', name: 'Track One', src: '/tmp/t1.mp3', tags: [musiqueId], createdAt: '2024-01-01', updatedAt: '2024-01-01'});
        expect(tracks.find(t => t.id === 't2')).toEqual({id: 't2', name: 'Track Two', src: '/tmp/t2.mp3', tags: [bruitageId]});
    });

    it('falls back to an empty tags array when the legacy tag name has no match', () => {
        const name = 'test-migration-030-fallback-' + Date.now() + '-' + Math.random().toString(36).slice(2);
        const cwd = os.tmpdir();

        const legacy = new Store({name, cwd, projectVersion: '0.1.0', migrations});
        legacyPath = legacy.path;
        legacy.set('tracks', [{id: 't1', name: 'Track One', src: '/tmp/t1.mp3', color: '#000', tag: 'Jazz'}]);

        const migrated = new Store({name, cwd, projectVersion: '0.3.0', migrations});

        expect(migrated.get('tracks').find(t => t.id === 't1')).toEqual({id: 't1', name: 'Track One', src: '/tmp/t1.mp3', tags: []});
    });

    it('leaves a track untouched if it was already migrated (tags already an array)', () => {
        const name = 'test-migration-030-already-migrated-' + Date.now() + '-' + Math.random().toString(36).slice(2);
        const cwd = os.tmpdir();

        const legacy = new Store({name, cwd, projectVersion: '0.1.0', migrations});
        legacyPath = legacy.path;
        legacy.set('tracks', [{id: 't1', name: 'Track One', src: '/tmp/t1.mp3', tags: ['some-tag-id']}]);

        const migrated = new Store({name, cwd, projectVersion: '0.3.0', migrations});

        expect(migrated.get('tracks')).toEqual([{id: 't1', name: 'Track One', src: '/tmp/t1.mp3', tags: ['some-tag-id']}]);
    });
});
