const {sourcesFromStep} = require('../stepMediaSources.js');

describe('sourcesFromStep', () => {
    it('returns no entry for a time step', () => {
        const step = {id: 's1', type: 'time', name: 'Time'};

        expect(sourcesFromStep(step)).toEqual([]);
    });

    it('returns no entry for a battle-royal step', () => {
        const step = {id: 's1', type: 'battle-royal', name: 'BR'};

        expect(sourcesFromStep(step)).toEqual([]);
    });

    it('returns no entry for an unknown step type', () => {
        const step = {id: 's1', type: 'unknown', name: 'Mystery'};

        expect(sourcesFromStep(step)).toEqual([]);
    });

    it('returns a single media entry for an image step', () => {
        const step = {id: 's1', type: 'image', name: 'Image', src: '/tmp/a.png'};

        expect(sourcesFromStep(step)).toEqual([
            {id: 's1', kind: 'step', stepId: 's1', name: 'Image', src: '/tmp/a.png'},
        ]);
    });

    it('returns a single media entry for a video step', () => {
        const step = {id: 's2', type: 'video', name: 'Video', src: '/tmp/a.mp4'};

        expect(sourcesFromStep(step)).toEqual([
            {id: 's2', kind: 'step', stepId: 's2', name: 'Video', src: '/tmp/a.mp4'},
        ]);
    });

    it('returns a single media entry for a dubbing-video step', () => {
        const step = {id: 's3', type: 'dubbing-video', name: 'Dubbing', src: '/tmp/a.mov'};

        expect(sourcesFromStep(step)).toEqual([
            {id: 's3', kind: 'step', stepId: 's3', name: 'Dubbing', src: '/tmp/a.mov'},
        ]);
    });
});