const fs = require('fs/promises');
const os = require('os');
const path = require('path');
const ArchiverZipWriter = require('../ArchiverZipWriter.js');
const ExtractZipReader = require('../ExtractZipReader.js');
const ExportWorkflowUseCase = require('../../../application/useCase/workflow/ExportWorkflowUseCase.js');
const ImportWorkflowUseCase = require('../../../application/useCase/workflow/ImportWorkflowUseCase.js');
const CheckMediaFilesUseCase = require('../../../application/useCase/media/CheckMediaFilesUseCase.js');
const StepFactory = require('../../../application/entity/step/StepFactory.js');

describe('export/import round trip with real zip adapters', () => {
    let base;

    beforeEach(async () => {
        base = await fs.mkdtemp(path.join(os.tmpdir(), 'kaeros-rt-'));
    });

    afterEach(async () => {
        await fs.rm(base, {recursive: true, force: true});
    });

    it('restores a workflow with 2 media files byte for byte', async () => {
        const img = path.join(base, 'cover.png');
        const vid = path.join(base, 'clip.mp4');
        const imgBytes = Buffer.from([0, 1, 2, 3, 255]);
        const vidBytes = Buffer.alloc(200000, 7);
        await fs.writeFile(img, imgBytes);
        await fs.writeFile(vid, vidBytes);

        const steps = [
            StepFactory.fromData({id: 's1', type: 'image', name: 'Cover', src: img, scale: 60}),
            StepFactory.fromData({id: 's2', type: 'time', name: 'Timer', impro: false, minutes: 5}),
            StepFactory.fromData({id: 's3', type: 'dubbing-video', name: 'Clip', src: vid, startOffsetMs: 100, endOffsetMs: 900, fadeInMs: 10, fadeOutMs: 20}),
        ];
        const exporter = new ExportWorkflowUseCase(
            {execute: async () => [{id: 'wf1', name: 'Show', color: '#abc'}]},
            {execute: async () => steps},
            new CheckMediaFilesUseCase(),
            new ArchiverZipWriter(),
            () => 'test'
        );
        const zipPath = path.join(base, 'out.zip');
        expect(await exporter.execute('wf1', zipPath)).toEqual({ok: true, path: zipPath});
        await expect(fs.access(`${zipPath}.tmp`)).rejects.toThrow();

        const createdSteps = [];
        const createdWorkflows = [];
        const importer = new ImportWorkflowUseCase(
            new ExtractZipReader(),
            {execute: async (w) => createdWorkflows.push(w)},
            {execute: async (wid, step, after) => createdSteps.splice(after + 1, 0, step)},
            {execute: async () => {}},
            (id) => path.join(base, 'imported', id)
        );
        const result = await importer.execute(zipPath);

        expect(result.ok).toBe(true);
        expect(createdWorkflows[0]).toMatchObject({id: result.workflowId, name: 'Show', color: '#abc'});
        expect(createdSteps.map((s) => s.name)).toEqual(['Cover', 'Timer', 'Clip']);
        expect(createdSteps.map((s) => s.id)).not.toContain('s1');
        expect(createdSteps[0]).toMatchObject({scale: 60});
        expect(createdSteps[2]).toMatchObject({startOffsetMs: 100, endOffsetMs: 900, fadeInMs: 10, fadeOutMs: 20});
        expect(await fs.readFile(createdSteps[0].src)).toEqual(imgBytes);
        expect(await fs.readFile(createdSteps[2].src)).toEqual(vidBytes);
        expect(createdSteps[0].src.startsWith(path.join(base, 'imported', result.workflowId))).toBe(true);
    });
});
