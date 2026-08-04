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

    it('defaults a missing startOffsetMs to 0', () => {
        const track = {name: 'Track One', tags: ['tag1']};
        const result = validTrackUseCase.execute(track);
        expect(result.startOffsetMs).toBe(0);
    });

    it('keeps a valid non-negative integer startOffsetMs', () => {
        const track = {name: 'Track One', tags: ['tag1'], startOffsetMs: 250};
        const result = validTrackUseCase.execute(track);
        expect(result.startOffsetMs).toBe(250);
    });

    it('coerces a numeric string startOffsetMs to a number', () => {
        const track = {name: 'Track One', tags: ['tag1'], startOffsetMs: '250'};
        const result = validTrackUseCase.execute(track);
        expect(result.startOffsetMs).toBe(250);
    });

    it('rejects a negative startOffsetMs', () => {
        expect(() => validTrackUseCase.execute({name: 'Track One', tags: ['tag1'], startOffsetMs: -1})).toThrow('Invalid track start offset');
    });

    it('rejects a non-integer startOffsetMs', () => {
        expect(() => validTrackUseCase.execute({name: 'Track One', tags: ['tag1'], startOffsetMs: 1.5})).toThrow('Invalid track start offset');
    });
});
