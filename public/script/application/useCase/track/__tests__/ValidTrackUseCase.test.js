const ValidTrackUseCase = require('../ValidTrackUseCase');

describe('ValidTrackUseCase', () => {
    const validTrackUseCase = new ValidTrackUseCase();

    it('accepts a track with a non-empty name and a recognized tag', () => {
        const track = {name: 'Track One', tag: 'Musique'};
        expect(validTrackUseCase.execute(track)).toBe(track);
    });

    it.each(['Musique', 'Bruitage', 'Disco'])('accepts the %s tag', (tag) => {
        expect(() => validTrackUseCase.execute({name: 'Track One', tag})).not.toThrow();
    });

    it('rejects a missing or empty name', () => {
        expect(() => validTrackUseCase.execute({name: '', tag: 'Musique'})).toThrow('Invalid track name');
        expect(() => validTrackUseCase.execute({tag: 'Musique'})).toThrow('Invalid track name');
    });

    it('rejects a tag outside Musique/Bruitage/Disco', () => {
        expect(() => validTrackUseCase.execute({name: 'Track One', tag: 'Jazz'})).toThrow('Invalid track tag');
        expect(() => validTrackUseCase.execute({name: 'Track One'})).toThrow('Invalid track tag');
    });
});
