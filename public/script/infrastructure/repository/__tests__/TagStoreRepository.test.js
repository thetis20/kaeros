const os = require('os');
const fs = require('fs');
const Store = require('electron-store').default;

describe('TagStoreRepository', () => {
    let tempStore;
    let TagStoreRepository;
    let repository;

    beforeEach(() => {
        jest.resetModules();
        tempStore = new Store({
            name: 'test-tags-' + Date.now() + '-' + Math.random().toString(36).slice(2),
            cwd: os.tmpdir(),
        });
        jest.doMock('../store.js', () => tempStore);
        TagStoreRepository = require('../TagStoreRepository');
        repository = new TagStoreRepository();
    });

    afterEach(() => {
        if (fs.existsSync(tempStore.path)) fs.unlinkSync(tempStore.path);
        jest.dontMock('../store.js');
    });

    it('starts with an empty list', async () => {
        expect(await repository.getAll()).toEqual([]);
    });

    it('creates and lists a tag', async () => {
        const tag = {id: 'tag1', name: 'Rock', color: '#4C6EFF'};
        await repository.create(tag);

        expect(await repository.getAll()).toEqual([tag]);
    });

    it('appends without overwriting previously created tags', async () => {
        await repository.create({id: 'tag1', name: 'Rock', color: '#4C6EFF'});
        await repository.create({id: 'tag2', name: 'Jazz', color: '#F76707'});

        expect(await repository.getAll()).toEqual([
            {id: 'tag1', name: 'Rock', color: '#4C6EFF'},
            {id: 'tag2', name: 'Jazz', color: '#F76707'},
        ]);
    });
});
