const StepFactory = require('../StepFactory');
const ImageStep = require('../ImageStep');
const DubbingVideoStep = require('../DubbingVideoStep');
const VideoStep = require('../VideoStep');
const TimeStep = require('../TimeStep');
const BattleRoyalStep = require('../BattleRoyalStep');

describe('StepFactory', () => {
    const createdAt = new Date('2024-01-01T00:00:00.000Z');
    const updatedAt = new Date('2024-01-02T00:00:00.000Z');

    it('reconstructs a dubbing-video step with its offsets when data carries them', () => {
        const data = {
            type: 'dubbing-video',
            id: 's1',
            name: 'Step One',
            src: '/tmp/video.mp4',
            description: 'A description',
            time: '2min',
            startOffsetMs: 250,
            endOffsetMs: 5000,
            fadeOutMs: 2000,
            fadeInMs: 1500,
            createdAt,
            updatedAt,
        };

        const step = StepFactory.fromData(data);

        expect(step).toBeInstanceOf(DubbingVideoStep);
        expect(step.startOffsetMs).toBe(250);
        expect(step.endOffsetMs).toBe(5000);
        expect(step.fadeOutMs).toBe(2000);
        expect(step.fadeInMs).toBe(1500);
    });

    it('defaults startOffsetMs and endOffsetMs when data was stored before the fields existed', () => {
        const data = {
            type: 'dubbing-video',
            id: 's1',
            name: 'Step One',
            src: '/tmp/video.mp4',
            description: 'A description',
            time: '2min',
            createdAt,
            updatedAt,
        };

        const step = StepFactory.fromData(data);

        expect(step.startOffsetMs).toBe(0);
        expect(step.endOffsetMs).toBeNull();
    });

    it('reconstructs an image step', () => {
        const step = StepFactory.fromData({type: 'image', id: 's1', name: 'Step One', src: '/tmp/img.png', createdAt, updatedAt});
        expect(step).toBeInstanceOf(ImageStep);
        expect(step.src).toBe('/tmp/img.png');
    });

    it('reconstructs a video step', () => {
        const step = StepFactory.fromData({type: 'video', id: 's1', name: 'Step One', src: '/tmp/video.mp4', loop: true, createdAt, updatedAt});
        expect(step).toBeInstanceOf(VideoStep);
        expect(step.loop).toBe(true);
    });

    it('reconstructs a time step', () => {
        const step = StepFactory.fromData({type: 'time', id: 's1', name: 'Step One', impro: 1, minutes: 5, createdAt, updatedAt});
        expect(step).toBeInstanceOf(TimeStep);
        expect(step.minutes).toBe(5);
    });

    it('reconstructs a battle-royal step', () => {
        const step = StepFactory.fromData({type: 'battle-royal', id: 's1', name: 'Step One', players: ['p1', 'p2'], createdAt, updatedAt});
        expect(step).toBeInstanceOf(BattleRoyalStep);
        expect(step.players).toEqual(['p1', 'p2']);
    });
});
