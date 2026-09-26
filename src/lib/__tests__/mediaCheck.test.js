import {checkWorkflowMedia, checkLocalSteps, hasIssues, messageKeyFor} from '../mediaCheck';
import {probeAll} from '../mediaProbe';

jest.mock('../mediaProbe', () => ({
    probeAll: jest.fn(),
}));

describe('mediaCheck', () => {
    beforeEach(() => {
        window.electronAPI = {
            mediaCheckPaths: jest.fn(),
            mediaCheckWorkflow: jest.fn(),
        };
        probeAll.mockReset();
        probeAll.mockImplementation(async (items) => items.map((item) => ({...item, code: 'ok'})));
    });

    describe('messageKeyFor', () => {
        it('builds the i18n key from the error code', () => {
            expect(messageKeyFor('missing')).toBe('mediaCheck.error.missing');
            expect(messageKeyFor('decode-failed')).toBe('mediaCheck.error.decode-failed');
        });
    });

    describe('hasIssues', () => {
        it('is true as soon as one entry is not ok', () => {
            expect(hasIssues([{code: 'ok'}, {code: 'missing'}])).toBe(true);
        });

        it('is false when every entry is ok', () => {
            expect(hasIssues([{code: 'ok'}, {code: 'ok'}])).toBe(false);
        });

        it('is false for an empty list', () => {
            expect(hasIssues([])).toBe(false);
        });
    });

    describe('checkWorkflowMedia', () => {
        it('does not send an entry whose disk stage already failed to probeAll', async () => {
            window.electronAPI.mediaCheckWorkflow.mockResolvedValue([
                {id: 's1', kind: 'step', stepId: 's1', name: 'Step 1', src: '/tmp/missing.mp4', code: 'missing'},
            ]);

            const results = await checkWorkflowMedia('wf-1');

            const probedIds = probeAll.mock.calls[0][0].map((item) => item.id);
            expect(probedIds).not.toContain('s1');
            expect(results).toEqual([
                {id: 's1', kind: 'step', stepId: 's1', name: 'Step 1', src: '/tmp/missing.mp4', code: 'missing'},
            ]);
        });

        it('sends an entry whose disk stage passed to probeAll, with a resolved type', async () => {
            window.electronAPI.mediaCheckWorkflow.mockResolvedValue([
                {id: 'a1', kind: 'audio', name: 'Track', src: '/tmp/track.mp3', code: 'ok'},
            ]);

            const results = await checkWorkflowMedia('wf-1');

            expect(probeAll).toHaveBeenCalled();
            const probedItems = probeAll.mock.calls[0][0];
            expect(probedItems).toHaveLength(1);
            expect(probedItems[0]).toEqual(expect.objectContaining({id: 'a1', type: 'audio'}));
            expect(results).toEqual([
                {id: 'a1', kind: 'audio', name: 'Track', src: '/tmp/track.mp3', type: 'audio', code: 'ok'},
            ]);
        });

        it('preserves the full entry list, including ok and failed entries, in order', async () => {
            window.electronAPI.mediaCheckWorkflow.mockResolvedValue([
                {id: 's1', kind: 'step', stepId: 's1', name: 'Step 1', src: '/tmp/missing.mp4', code: 'missing'},
                {id: 'a1', kind: 'audio', name: 'Track', src: '/tmp/track.mp3', code: 'ok'},
            ]);

            const results = await checkWorkflowMedia('wf-1');

            expect(results.map((r) => r.id)).toEqual(['s1', 'a1']);
        });
    });

    describe('checkLocalSteps', () => {
        it('ignores time and battle-royal steps entirely', async () => {
            const steps = [
                {id: 't1', type: 'time', name: 'Time'},
                {id: 'b1', type: 'battle-royal', name: 'Battle'},
            ];

            const results = await checkLocalSteps(steps);

            expect(results).toEqual([]);
            expect(window.electronAPI.mediaCheckPaths).not.toHaveBeenCalled();
            expect(probeAll).toHaveBeenCalledWith([]);
        });

        it('skips the disk stage and probes directly via blob for a step carrying a freshly picked File', async () => {
            const file = new File(['video'], 'video.mp4', {type: 'video/mp4'});
            const steps = [{id: 's1', type: 'video', name: 'Step 1', file}];

            const results = await checkLocalSteps(steps);

            expect(window.electronAPI.mediaCheckPaths).not.toHaveBeenCalled();
            const probedItems = probeAll.mock.calls[0][0];
            expect(probedItems).toEqual([
                expect.objectContaining({id: 's1', file, type: 'video', code: 'ok'}),
            ]);
            expect(results).toEqual([
                {id: 's1', stepId: 's1', name: 'Step 1', src: undefined, code: 'ok', type: 'video'},
            ]);
        });

        it('checks the disk stage for a step with only a saved src, and does not probe it when the disk stage fails', async () => {
            window.electronAPI.mediaCheckPaths.mockResolvedValue([
                {id: 's1', src: '/tmp/missing.png', code: 'missing'},
            ]);
            const steps = [{id: 's1', type: 'image', name: 'Step 1', src: '/tmp/missing.png'}];

            const results = await checkLocalSteps(steps);

            expect(window.electronAPI.mediaCheckPaths).toHaveBeenCalledWith([{id: 's1', src: '/tmp/missing.png'}]);
            const probedIds = probeAll.mock.calls[0][0].map((item) => item.id);
            expect(probedIds).not.toContain('s1');
            expect(results).toEqual([
                {id: 's1', stepId: 's1', name: 'Step 1', src: '/tmp/missing.png', code: 'missing', type: 'image'},
            ]);
        });

        it('probes a step with a saved src once the disk stage passes', async () => {
            window.electronAPI.mediaCheckPaths.mockResolvedValue([
                {id: 's1', src: '/tmp/ok.png', code: 'ok'},
            ]);
            const steps = [{id: 's1', type: 'image', name: 'Step 1', src: '/tmp/ok.png'}];

            const results = await checkLocalSteps(steps);

            const probedItems = probeAll.mock.calls[0][0];
            expect(probedItems).toEqual([
                expect.objectContaining({id: 's1', src: '/tmp/ok.png', type: 'image', code: 'ok'}),
            ]);
            expect(results).toEqual([
                {id: 's1', stepId: 's1', name: 'Step 1', src: '/tmp/ok.png', code: 'ok', type: 'image'},
            ]);
        });
    });
});