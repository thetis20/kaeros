const CreateTrackUseCase = require('../CreateTrackUseCase');

describe('CreateTrackUseCase', () => {
    function fakeRepository() {
        const created = [];
        return {created, create: async (track) => { created.push(track); }};
    }

    it('generates a fresh id and persists a valid track', async () => {
        const repository = fakeRepository();
        const createTrackUseCase = new CreateTrackUseCase(repository);

        const result = await createTrackUseCase.execute({name: 'Track One', src: '/tmp/t1.mp3', color: '#4C6EFF', tag: 'Musique'});

        expect(result.id).toEqual(expect.any(String));
        expect(result.id.length).toBeGreaterThan(0);
        expect(result.name).toBe('Track One');
        expect(result.tag).toBe('Musique');
        expect(repository.created).toEqual([result]);
    });

    it('throws and does not persist when the track is invalid', async () => {
        const repository = fakeRepository();
        const createTrackUseCase = new CreateTrackUseCase(repository);

        await expect(createTrackUseCase.execute({name: '', src: '/tmp/t1.mp3', color: '#4C6EFF', tag: 'Musique'})).rejects.toThrow('Invalid track name');
        expect(repository.created).toEqual([]);
    });
});
