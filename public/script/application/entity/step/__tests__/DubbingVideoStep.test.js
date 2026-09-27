const DubbingVideoStep = require('../DubbingVideoStep');

describe('DubbingVideoStep entity', () => {
    it('assigns id, name, src, description, time, startOffsetMs, endOffsetMs, fadeOutMs, fadeInMs, createdAt and updatedAt from the constructor', () => {
        const createdAt = new Date('2024-01-01T00:00:00.000Z');
        const updatedAt = new Date('2024-01-02T00:00:00.000Z');
        const step = new DubbingVideoStep('s1', 'Step One', '/tmp/video.mp4', 'A description', '2min', 250, 5000, 2000, 1500, createdAt, updatedAt);

        expect(step.id).toBe('s1');
        expect(step.name).toBe('Step One');
        expect(step.type).toBe('dubbing-video');
        expect(step.src).toBe('/tmp/video.mp4');
        expect(step.description).toBe('A description');
        expect(step.time).toBe('2min');
        expect(step.startOffsetMs).toBe(250);
        expect(step.endOffsetMs).toBe(5000);
        expect(step.fadeOutMs).toBe(2000);
        expect(step.fadeInMs).toBe(1500);
        expect(step.createdAt).toBe(createdAt);
        expect(step.updatedAt).toBe(updatedAt);
    });

    it('defaults startOffsetMs to 0, endOffsetMs to null, fadeOutMs to 1000 and fadeInMs to 1000 when omitted', () => {
        const step = new DubbingVideoStep('s1', 'Step One', '/tmp/video.mp4', 'A description', '2min');

        expect(step.startOffsetMs).toBe(0);
        expect(step.endOffsetMs).toBeNull();
        expect(step.fadeOutMs).toBe(1000);
        expect(step.fadeInMs).toBe(1000);
        expect(step.createdAt).toBeInstanceOf(Date);
        expect(step.updatedAt).toBeInstanceOf(Date);
    });
});
