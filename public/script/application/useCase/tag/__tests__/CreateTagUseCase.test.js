const CreateTagUseCase = require('../CreateTagUseCase');
const TAG_COLOR_PALETTE = require('../../../entity/tagColorPalette');

describe('CreateTagUseCase', () => {
    function fakeRepository(existing = []) {
        const created = [];
        return {
            created,
            getAll: async () => existing,
            create: async (tag) => { created.push(tag); },
        };
    }

    it('generates a fresh id and persists a valid tag', async () => {
        const repository = fakeRepository();
        const createTagUseCase = new CreateTagUseCase(repository);

        const result = await createTagUseCase.execute({name: 'Rock'});

        expect(result.id).toEqual(expect.any(String));
        expect(result.id.length).toBeGreaterThan(0);
        expect(result.name).toBe('Rock');
        expect(repository.created).toEqual([result]);
    });

    it('assigns the color at palette[existingTagsCount % palette.length]', async () => {
        const zero = fakeRepository([]);
        expect((await new CreateTagUseCase(zero).execute({name: 'A'})).color).toBe(TAG_COLOR_PALETTE[0]);

        const three = fakeRepository([{id: '1', name: 'A'}, {id: '2', name: 'B'}, {id: '3', name: 'C'}]);
        expect((await new CreateTagUseCase(three).execute({name: 'D'})).color).toBe(TAG_COLOR_PALETTE[3]);

        const eight = fakeRepository(Array.from({length: 8}, (_, i) => ({id: String(i), name: 'T' + i})));
        expect((await new CreateTagUseCase(eight).execute({name: 'Z'})).color).toBe(TAG_COLOR_PALETTE[8 % TAG_COLOR_PALETTE.length]);
    });

    it('returns the existing tag instead of creating a duplicate (case/space insensitive)', async () => {
        const createdAt = new Date('2024-01-01T00:00:00.000Z');
        const updatedAt = new Date('2024-01-02T00:00:00.000Z');
        const existingTag = {id: 'tag1', name: 'Rock', color: '#4C6EFF', createdAt, updatedAt};
        const repository = fakeRepository([existingTag]);
        const createTagUseCase = new CreateTagUseCase(repository);

        const result = await createTagUseCase.execute({name: ' rock '});

        expect(result).toEqual(existingTag);
        expect(repository.created).toEqual([]);
    });

    it('throws and does not persist when the tag is invalid', async () => {
        const repository = fakeRepository();
        const createTagUseCase = new CreateTagUseCase(repository);

        await expect(createTagUseCase.execute({name: ''})).rejects.toThrow('Invalid tag name');
        expect(repository.created).toEqual([]);
    });
});
