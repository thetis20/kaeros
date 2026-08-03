const ListTagUseCase = require('../ListTagUseCase');
const Tag = require('../../../entity/Tag');

describe('ListTagUseCase', () => {
    it('reconstructs Tag entities from raw stored tag data', async () => {
        const createdAt = new Date('2024-01-01T00:00:00.000Z');
        const updatedAt = new Date('2024-01-02T00:00:00.000Z');
        const fakeRepository = {
            getAll: async () => [{id: 'tag1', name: 'Rock', color: '#4C6EFF', createdAt, updatedAt}],
        };
        const listTagUseCase = new ListTagUseCase(fakeRepository);

        const tags = await listTagUseCase.execute();

        expect(tags).toHaveLength(1);
        expect(tags[0]).toBeInstanceOf(Tag);
        expect(tags[0]).toEqual(new Tag('tag1', 'Rock', '#4C6EFF', createdAt, updatedAt));
    });

    it('returns an empty array when there are no stored tags', async () => {
        const fakeRepository = {getAll: async () => []};
        const listTagUseCase = new ListTagUseCase(fakeRepository);

        expect(await listTagUseCase.execute()).toEqual([]);
    });
});
