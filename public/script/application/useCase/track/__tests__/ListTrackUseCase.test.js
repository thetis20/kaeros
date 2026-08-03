const ListTrackUseCase = require('../ListTrackUseCase');
const Audio = require('../../../entity/Audio');

describe('ListTrackUseCase', () => {
    it('reconstructs Audio entities from raw stored track data', async () => {
        const createdAt = new Date('2024-01-01T00:00:00.000Z');
        const updatedAt = new Date('2024-01-02T00:00:00.000Z');
        const fakeRepository = {
            getAll: async () => [{id: 't1', name: 'Track One', src: '/tmp/t1.mp3', tags: ['tag1'], createdAt, updatedAt}],
        };
        const listTrackUseCase = new ListTrackUseCase(fakeRepository);

        const tracks = await listTrackUseCase.execute();

        expect(tracks).toHaveLength(1);
        expect(tracks[0]).toBeInstanceOf(Audio);
        expect(tracks[0]).toEqual(new Audio('t1', 'Track One', '/tmp/t1.mp3', ['tag1'], createdAt, updatedAt));
    });

    it('returns an empty array when there are no stored tracks', async () => {
        const fakeRepository = {getAll: async () => []};
        const listTrackUseCase = new ListTrackUseCase(fakeRepository);

        expect(await listTrackUseCase.execute()).toEqual([]);
    });
});
