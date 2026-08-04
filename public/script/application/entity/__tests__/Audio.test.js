const Audio = require('../Audio');

describe('Audio entity', () => {
    it('assigns id, name, src, tags, startOffsetMs, createdAt and updatedAt from the constructor', () => {
        const createdAt = new Date('2024-01-01T00:00:00.000Z');
        const updatedAt = new Date('2024-01-02T00:00:00.000Z');
        const audio = new Audio('a1', 'Track One', '/tmp/track1.mp3', ['tag1'], 250, createdAt, updatedAt);

        expect(audio.id).toBe('a1');
        expect(audio.name).toBe('Track One');
        expect(audio.src).toBe('/tmp/track1.mp3');
        expect(audio.tags).toEqual(['tag1']);
        expect(audio.startOffsetMs).toBe(250);
        expect(audio.createdAt).toBe(createdAt);
        expect(audio.updatedAt).toBe(updatedAt);
        expect(audio.playing).toBeUndefined();
    });

    it('defaults startOffsetMs, createdAt and updatedAt when omitted', () => {
        const audio = new Audio('a1', 'Track One', '/tmp/track1.mp3', ['tag1']);

        expect(audio.startOffsetMs).toBe(0);
        expect(audio.createdAt).toBeInstanceOf(Date);
        expect(audio.updatedAt).toBeInstanceOf(Date);
    });
});
