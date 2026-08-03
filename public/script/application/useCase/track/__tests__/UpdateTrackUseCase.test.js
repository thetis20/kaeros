const UpdateTrackUseCase = require('../UpdateTrackUseCase');

describe('UpdateTrackUseCase', () => {
    function fakeRepository() {
        const updated = [];
        return {updated, update: async (id, track) => { updated.push({id, track}); }};
    }

    it('sets updatedAt and persists a valid track update', async () => {
        const repository = fakeRepository();
        const updateTrackUseCase = new UpdateTrackUseCase(repository);
        const track = {id: 't1', name: 'Track One', src: '/tmp/t1.mp3', tags: ['tag1'], createdAt: new Date('2024-01-01')};

        await updateTrackUseCase.execute('t1', track);

        expect(repository.updated).toHaveLength(1);
        expect(repository.updated[0].id).toBe('t1');
        expect(repository.updated[0].track.updatedAt).toBeInstanceOf(Date);
    });

    it('throws and does not persist when the tags are invalid', async () => {
        const repository = fakeRepository();
        const updateTrackUseCase = new UpdateTrackUseCase(repository);

        await expect(updateTrackUseCase.execute('t1', {id: 't1', name: 'Track One', tags: []})).rejects.toThrow('Invalid track tags');
        expect(repository.updated).toEqual([]);
    });
});
