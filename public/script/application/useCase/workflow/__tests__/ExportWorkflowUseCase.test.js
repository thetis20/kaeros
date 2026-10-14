const ExportWorkflowUseCase = require('../ExportWorkflowUseCase.js');

const build = ({steps, check}) => {
    const zipWriter = {write: jest.fn().mockResolvedValue(undefined)};
    const checkMediaFilesUseCase = {
        execute: jest.fn(check || (async (items) => items.map((i) => ({...i, code: 'ok'})))),
    };
    const useCase = new ExportWorkflowUseCase(
        {execute: jest.fn().mockResolvedValue([{id: 'wf1', name: 'Show', color: '#fff', createdAt: 'x'}])},
        {execute: jest.fn().mockResolvedValue(steps)},
        checkMediaFilesUseCase,
        zipWriter,
        () => '1.2.3'
    );
    return {useCase, zipWriter, checkMediaFilesUseCase};
};

describe('ExportWorkflowUseCase', () => {
    it('writes a manifest with relative src, deduplicated media and no ids/dates', async () => {
        const steps = [
            {id: 's1', type: 'image', name: 'A', src: '/a/pic.png', scale: 50, createdAt: 'c', updatedAt: 'u'},
            {id: 's2', type: 'time', name: 'T', minutes: 3},
            {id: 's3', type: 'video', name: 'B', src: '/a/pic.png', loop: true},
            {id: 's4', type: 'dubbing-video', name: 'C', src: '/b/clip.mp4'},
        ];
        const {useCase, zipWriter} = build({steps});

        const result = await useCase.execute('wf1', '/out.zip');

        expect(result).toEqual({ok: true, path: '/out.zip'});
        const [dest, {json, files}] = zipWriter.write.mock.calls[0];
        expect(dest).toBe('/out.zip');
        expect(files).toEqual([
            {source: '/a/pic.png', name: 'media/1-pic.png'},
            {source: '/b/clip.mp4', name: 'media/2-clip.mp4'},
        ]);
        expect(json.name).toBe('session.json');
        const manifest = JSON.parse(json.content);
        expect(manifest).toMatchObject({format: 'kaeros-session', version: 1, appVersion: '1.2.3', workflow: {name: 'Show', color: '#fff'}});
        expect(manifest.steps.map((s) => s.src)).toEqual(['media/1-pic.png', undefined, 'media/1-pic.png', 'media/2-clip.mp4']);
        expect(manifest.steps[0]).toMatchObject({type: 'image', name: 'A', scale: 50});
        for (const step of manifest.steps) {
            expect(step).not.toHaveProperty('id');
            expect(step).not.toHaveProperty('createdAt');
            expect(step).not.toHaveProperty('updatedAt');
        }
    });

    it('refuses the export when a media is missing and writes nothing', async () => {
        const {useCase, zipWriter} = build({
            steps: [{id: 's1', type: 'image', name: 'A', src: '/gone.png'}],
            check: async (items) => items.map((i) => ({...i, code: 'missing'})),
        });

        const result = await useCase.execute('wf1', '/out.zip');

        expect(result.ok).toBe(false);
        expect(result.issues).toEqual([expect.objectContaining({id: 's1', code: 'missing', src: '/gone.png'})]);
        expect(zipWriter.write).not.toHaveBeenCalled();
    });

    it('returns not-found for an unknown workflow', async () => {
        const {useCase} = build({steps: []});

        expect(await useCase.execute('nope', '/out.zip')).toEqual({ok: false, error: 'not-found'});
    });

    it('returns a write error when the zip writer fails', async () => {
        const {useCase, zipWriter} = build({steps: []});
        zipWriter.write.mockRejectedValue(new Error('disk full'));

        expect(await useCase.execute('wf1', '/out.zip')).toEqual({ok: false, error: 'write'});
    });
});
