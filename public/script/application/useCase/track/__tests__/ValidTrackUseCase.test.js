const ValidTrackUseCase = require('../ValidTrackUseCase');

describe('ValidTrackUseCase', () => {
    const validTrackUseCase = new ValidTrackUseCase();

    it('accepts a track with a non-empty name and a non-empty tags array', () => {
        const track = {name: 'Track One', tags: ['tag1']};
        expect(validTrackUseCase.execute(track)).toBe(track);
    });

    it('accepts a track with several tags', () => {
        expect(() => validTrackUseCase.execute({name: 'Track One', tags: ['tag1', 'tag2']})).not.toThrow();
    });

    it('rejects a missing or empty name', () => {
        expect(() => validTrackUseCase.execute({name: '', tags: ['tag1']})).toThrow('Invalid track name');
        expect(() => validTrackUseCase.execute({tags: ['tag1']})).toThrow('Invalid track name');
    });

    it('rejects an empty, missing or non-array tags value', () => {
        expect(() => validTrackUseCase.execute({name: 'Track One', tags: []})).toThrow('Invalid track tags');
        expect(() => validTrackUseCase.execute({name: 'Track One'})).toThrow('Invalid track tags');
        expect(() => validTrackUseCase.execute({name: 'Track One', tags: 'tag1'})).toThrow('Invalid track tags');
    });
});
