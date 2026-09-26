const CheckWorkflowMediaUseCase = require('../CheckWorkflowMediaUseCase.js');

describe('CheckWorkflowMediaUseCase', () => {
    it('produces no entry for time and battle-royal steps', async () => {
        const listStepByWorkflowUseCase = {
            execute: jest.fn().mockResolvedValue([
                {id: 's1', type: 'time', name: 'Time'},
                {id: 's2', type: 'battle-royal', name: 'BR'},
            ]),
        };
        const listTrackUseCase = {execute: jest.fn().mockResolvedValue([])};
        const checkMediaFilesUseCase = {execute: jest.fn().mockResolvedValue([])};
        const useCase = new CheckWorkflowMediaUseCase(listStepByWorkflowUseCase, listTrackUseCase, checkMediaFilesUseCase);

        await useCase.execute('wf1');

        expect(checkMediaFilesUseCase.execute).toHaveBeenCalledWith([]);
    });

    it('includes musics as audio-kind entries', async () => {
        const listStepByWorkflowUseCase = {execute: jest.fn().mockResolvedValue([])};
        const listTrackUseCase = {
            execute: jest.fn().mockResolvedValue([
                {id: 'a1', name: 'Track A', src: '/tmp/a.mp3'},
            ]),
        };
        const checkMediaFilesUseCase = {execute: jest.fn().mockResolvedValue([])};
        const useCase = new CheckWorkflowMediaUseCase(listStepByWorkflowUseCase, listTrackUseCase, checkMediaFilesUseCase);

        await useCase.execute('wf1');

        expect(checkMediaFilesUseCase.execute).toHaveBeenCalledWith([
            {id: 'a1', kind: 'audio', name: 'Track A', src: '/tmp/a.mp3'},
        ]);
    });

    it('preserves workflow step order, steps first then musics', async () => {
        const listStepByWorkflowUseCase = {
            execute: jest.fn().mockResolvedValue([
                {id: 's1', type: 'image', name: 'Image 1', src: '/tmp/img1.png'},
                {id: 's2', type: 'time', name: 'Time'},
                {id: 's3', type: 'video', name: 'Video 1', src: '/tmp/vid1.mp4'},
            ]),
        };
        const listTrackUseCase = {
            execute: jest.fn().mockResolvedValue([
                {id: 'a1', name: 'Track A', src: '/tmp/a.mp3'},
                {id: 'a2', name: 'Track B', src: '/tmp/b.mp3'},
            ]),
        };
        const checkMediaFilesUseCase = {execute: jest.fn().mockResolvedValue([])};
        const useCase = new CheckWorkflowMediaUseCase(listStepByWorkflowUseCase, listTrackUseCase, checkMediaFilesUseCase);

        await useCase.execute('wf1');

        expect(checkMediaFilesUseCase.execute).toHaveBeenCalledWith([
            {id: 's1', kind: 'step', stepId: 's1', name: 'Image 1', src: '/tmp/img1.png'},
            {id: 's3', kind: 'step', stepId: 's3', name: 'Video 1', src: '/tmp/vid1.mp4'},
            {id: 'a1', kind: 'audio', name: 'Track A', src: '/tmp/a.mp3'},
            {id: 'a2', kind: 'audio', name: 'Track B', src: '/tmp/b.mp3'},
        ]);
    });

    it('returns whatever checkMediaFilesUseCase resolves with', async () => {
        const listStepByWorkflowUseCase = {execute: jest.fn().mockResolvedValue([])};
        const listTrackUseCase = {execute: jest.fn().mockResolvedValue([])};
        const expected = [{id: 'x', code: 'ok'}];
        const checkMediaFilesUseCase = {execute: jest.fn().mockResolvedValue(expected)};
        const useCase = new CheckWorkflowMediaUseCase(listStepByWorkflowUseCase, listTrackUseCase, checkMediaFilesUseCase);

        const result = await useCase.execute('wf1');

        expect(result).toBe(expected);
    });
});