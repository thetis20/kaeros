const fs = require('fs/promises');
const os = require('os');
const path = require('path');
const ImportWorkflowUseCase = require('../ImportWorkflowUseCase.js');

describe('ImportWorkflowUseCase', () => {
    let base;
    let mediaRoot;

    beforeEach(async () => {
        base = await fs.mkdtemp(path.join(os.tmpdir(), 'kaeros-test-'));
        mediaRoot = path.join(base, 'userMedia');
    });

    afterEach(async () => {
        await fs.rm(base, {recursive: true, force: true});
    });

    const build = (manifest, files = {}, {extraEntries} = {}) => {
        let extractedTo;
        const zipReader = {
            extract: jest.fn(async (zip, dest) => {
                extractedTo = dest;
                if (manifest !== undefined) {
                    await fs.writeFile(path.join(dest, 'session.json'), typeof manifest === 'string' ? manifest : JSON.stringify(manifest));
                }
                for (const [name, content] of Object.entries(files)) {
                    await fs.mkdir(path.dirname(path.join(dest, name)), {recursive: true});
                    await fs.writeFile(path.join(dest, name), content);
                }
                if (extraEntries) await extraEntries(dest);
            }),
        };
        const created = [];
        const createWorkflowUseCase = {execute: jest.fn(async (w) => created.push(w))};
        const createStepUseCase = {execute: jest.fn().mockResolvedValue(undefined)};
        const deleteWorkflowUseCase = {execute: jest.fn().mockResolvedValue(undefined)};
        const useCase = new ImportWorkflowUseCase(
            zipReader, createWorkflowUseCase, createStepUseCase, deleteWorkflowUseCase,
            (id) => path.join(mediaRoot, id)
        );
        return {useCase, createWorkflowUseCase, createStepUseCase, deleteWorkflowUseCase, getTmp: () => extractedTo};
    };

    const manifest = (steps, over = {}) => ({
        format: 'kaeros-session', version: 1, workflow: {name: 'Show', color: '#fff'}, steps, ...over,
    });

    it('imports with new ids, absolute src and preserved order, then cleans the temp dir', async () => {
        const m = manifest([
            {type: 'image', name: 'A', src: 'media/1-pic.png', scale: 40},
            {type: 'time', name: 'T', impro: false, minutes: 2},
            {type: 'video', name: 'B', src: 'media/1-pic.png', loop: false},
        ]);
        const ctx = build(m, {'media/1-pic.png': 'IMG'});

        const result = await ctx.useCase.execute('/in.zip');

        expect(result.ok).toBe(true);
        const workflow = ctx.createWorkflowUseCase.execute.mock.calls[0][0];
        expect(workflow).toMatchObject({id: result.workflowId, name: 'Show', color: '#fff'});

        const calls = ctx.createStepUseCase.execute.mock.calls;
        expect(calls.map(([wid, , idx]) => [wid, idx])).toEqual([
            [result.workflowId, -1], [result.workflowId, 0], [result.workflowId, 1],
        ]);
        const steps = calls.map((c) => c[1]);
        expect(steps.map((s) => s.name)).toEqual(['A', 'T', 'B']);
        expect(new Set(steps.map((s) => s.id)).size).toBe(3);
        const expectedSrc = path.join(mediaRoot, result.workflowId, '1-pic.png');
        expect(steps[0].src).toBe(expectedSrc);
        expect(steps[2].src).toBe(expectedSrc);
        expect(await fs.readFile(expectedSrc, 'utf8')).toBe('IMG');
        await expect(fs.access(ctx.getTmp())).rejects.toThrow();
    });

    it('rejects an invalid format', async () => {
        const ctx = build(manifest([], {format: 'other'}));
        expect(await ctx.useCase.execute('/in.zip')).toEqual({ok: false, error: 'invalid'});
        expect(ctx.createWorkflowUseCase.execute).not.toHaveBeenCalled();
    });

    it('rejects a missing or unparsable manifest', async () => {
        expect(await build(undefined).useCase.execute('/in.zip')).toEqual({ok: false, error: 'invalid'});
        expect(await build('{nope').useCase.execute('/in.zip')).toEqual({ok: false, error: 'invalid'});
    });

    it('rejects an unsupported version', async () => {
        const ctx = build(manifest([], {version: 2}));
        expect(await ctx.useCase.execute('/in.zip')).toEqual({ok: false, error: 'version'});
    });

    it('rejects an unknown step type and creates nothing', async () => {
        const ctx = build(manifest([{type: 'martian', name: 'X'}]));
        expect(await ctx.useCase.execute('/in.zip')).toEqual({ok: false, error: 'step'});
        expect(ctx.createWorkflowUseCase.execute).not.toHaveBeenCalled();
    });

    it('rejects an invalid step (scale out of range)', async () => {
        const ctx = build(manifest([{type: 'image', name: 'A', src: 'media/1-a.png', scale: 500}]), {'media/1-a.png': 'x'});
        expect(await ctx.useCase.execute('/in.zip')).toEqual({ok: false, error: 'step'});
        expect(ctx.createWorkflowUseCase.execute).not.toHaveBeenCalled();
        await expect(fs.access(mediaRoot)).rejects.toThrow();
    });

    it.each([
        ['parent traversal', '../session.json'],
        ['escape from media', 'media/../session.json'],
        ['absolute path', '/etc/passwd'],
        ['missing file', 'media/nope.png'],
        ['empty', ''],
    ])('refuses a src that is not a real file in media/ (%s)', async (_label, src) => {
        const ctx = build(manifest([{type: 'image', name: 'A', src}]), {'media/ok.png': 'x'});
        const result = await ctx.useCase.execute('/in.zip');
        expect(result.ok).toBe(false);
        expect(ctx.createWorkflowUseCase.execute).not.toHaveBeenCalled();
    });

    it('refuses a symlink pointing outside media/', async () => {
        const secret = path.join(base, 'secret.txt');
        await fs.writeFile(secret, 'secret');
        const ctx = build(manifest([{type: 'image', name: 'A', src: 'media/1-link.png'}]), {}, {
            extraEntries: async (dest) => {
                await fs.mkdir(path.join(dest, 'media'), {recursive: true});
                await fs.symlink(secret, path.join(dest, 'media', '1-link.png'));
            },
        });
        const result = await ctx.useCase.execute('/in.zip');
        expect(result).toEqual({ok: false, error: 'invalid'});
        expect(ctx.createWorkflowUseCase.execute).not.toHaveBeenCalled();
    });

    it('rolls back the workflow and media dir when step creation fails', async () => {
        const m = manifest([{type: 'image', name: 'A', src: 'media/1-a.png'}, {type: 'time', name: 'T', minutes: 1}]);
        const ctx = build(m, {'media/1-a.png': 'x'});
        ctx.createStepUseCase.execute
            .mockResolvedValueOnce(undefined)
            .mockRejectedValueOnce(new Error('boom'));

        const result = await ctx.useCase.execute('/in.zip');

        expect(result.ok).toBe(false);
        const workflowId = ctx.createWorkflowUseCase.execute.mock.calls[0][0].id;
        expect(ctx.deleteWorkflowUseCase.execute).toHaveBeenCalledWith(workflowId);
        await expect(fs.access(path.join(mediaRoot, workflowId))).rejects.toThrow();
        await expect(fs.access(ctx.getTmp())).rejects.toThrow();
    });
});
