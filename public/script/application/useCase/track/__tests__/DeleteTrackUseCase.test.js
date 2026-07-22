const DeleteTrackUseCase = require('../DeleteTrackUseCase');

describe('DeleteTrackUseCase', () => {
    it('delegates deletion to the repository', async () => {
        const deleted = [];
        const repository = {delete: async (id) => { deleted.push(id); }};
        const deleteTrackUseCase = new DeleteTrackUseCase(repository);

        await deleteTrackUseCase.execute('t1');

        expect(deleted).toEqual(['t1']);
    });
});
