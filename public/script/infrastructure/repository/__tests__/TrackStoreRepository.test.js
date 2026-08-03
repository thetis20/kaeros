const os = require('os');
const fs = require('fs');
const Store = require('electron-store').default;

describe('TrackStoreRepository', () => {
    let tempStore;
    let TrackStoreRepository;
    let repository;

    beforeEach(() => {
        jest.resetModules();
        tempStore = new Store({
            name: 'test-tracks-' + Date.now() + '-' + Math.random().toString(36).slice(2),
            cwd: os.tmpdir(),
        });
        jest.doMock('../store.js', () => tempStore);
        TrackStoreRepository = require('../TrackStoreRepository');
        repository = new TrackStoreRepository();
    });

    afterEach(() => {
        if (fs.existsSync(tempStore.path)) fs.unlinkSync(tempStore.path);
        jest.dontMock('../store.js');
    });

    it('starts with an empty list', async () => {
        expect(await repository.getAll()).toEqual([]);
    });

    it('creates and lists a track', async () => {
        const track = {id: 't1', name: 'Track One', src: '/tmp/t1.mp3', tags: ['tag1']};
        await repository.create(track);

        expect(await repository.getAll()).toEqual([track]);
    });

    it('updates a track by id without touching other tracks', async () => {
        await repository.create({id: 't1', name: 'Track One', src: '/tmp/t1.mp3', tags: ['tag1']});
        await repository.create({id: 't2', name: 'Track Two', src: '/tmp/t2.mp3', tags: ['tag2']});

        await repository.update('t1', {id: 't1', name: 'Track One Edited', src: '/tmp/t1.mp3', tags: ['tag3']});

        const all = await repository.getAll();
        expect(all).toHaveLength(2);
        expect(all.find(t => t.id === 't1')).toEqual({id: 't1', name: 'Track One Edited', src: '/tmp/t1.mp3', tags: ['tag3']});
        expect(all.find(t => t.id === 't2').name).toBe('Track Two');
    });

    it('deletes a track by id', async () => {
        await repository.create({id: 't1', name: 'Track One', src: '/tmp/t1.mp3', tags: ['tag1']});
        await repository.delete('t1');

        expect(await repository.getAll()).toEqual([]);
    });
});
