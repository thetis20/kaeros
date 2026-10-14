const fs = require('fs/promises');
const os = require('os');
const path = require('path');
const {randomUUID} = require('crypto');
const Workflow = require('../../entity/Workflow.js');
const StepFactory = require('../../entity/step/StepFactory.js');
const ValidStepUseCase = require('../step/ValidStepUseCase.js');

const FORMAT = 'kaeros-session';
const VERSION = 1;
const MEDIA_TYPES = ['image', 'video', 'dubbing-video'];

class ImportError extends Error {
    constructor(code) {
        super(code);
        this.code = code;
    }
}

class ImportWorkflowUseCase {
    /**
     * @param {{extract: Function}} zipReader
     * @param {{execute: Function}} createWorkflowUseCase
     * @param {{execute: Function}} createStepUseCase
     * @param {{execute: Function}} deleteWorkflowUseCase
     * @param {(workflowId: string) => string} getMediaDir destination directory for the media of a workflow
     */
    constructor(zipReader, createWorkflowUseCase, createStepUseCase, deleteWorkflowUseCase, getMediaDir) {
        this.zipReader = zipReader;
        this.createWorkflowUseCase = createWorkflowUseCase;
        this.createStepUseCase = createStepUseCase;
        this.deleteWorkflowUseCase = deleteWorkflowUseCase;
        this.getMediaDir = getMediaDir;
        this.validStepUseCase = new ValidStepUseCase();
    }

    /**
     * @param {string} zipPath
     * @returns {Promise<{ok: true, workflowId: string} | {ok: false, error: 'invalid'|'version'|'step'}>}
     */
    async execute(zipPath) {
        const tmpDir = await fs.mkdtemp(path.join(os.tmpdir(), 'kaeros-import-'));
        const workflowId = randomUUID();
        const mediaDir = this.getMediaDir(workflowId);
        let workflowCreated = false;

        try {
            await this._extract(zipPath, tmpDir);
            const manifest = await this._readManifest(tmpDir);

            const copies = [];
            const steps = [];
            for (const data of manifest.steps) {
                steps.push(await this._buildStep(data, tmpDir, mediaDir, copies));
            }

            for (const {from, to} of copies) {
                await fs.mkdir(path.dirname(to), {recursive: true});
                await fs.copyFile(from, to);
            }

            const workflow = new Workflow(workflowId, manifest.workflow.name, manifest.workflow.color);
            try {
                await this.createWorkflowUseCase.execute(workflow);
            } catch (err) {
                throw new ImportError('invalid');
            }
            workflowCreated = true;

            for (let i = 0; i < steps.length; i++) {
                await this.createStepUseCase.execute(workflowId, steps[i], i - 1);
            }

            return {ok: true, workflowId};
        } catch (err) {
            if (workflowCreated) {
                await this.deleteWorkflowUseCase.execute(workflowId).catch(() => {});
            }
            await fs.rm(mediaDir, {recursive: true, force: true}).catch(() => {});
            return {ok: false, error: err instanceof ImportError ? err.code : 'invalid'};
        } finally {
            await fs.rm(tmpDir, {recursive: true, force: true}).catch(() => {});
        }
    }

    async _extract(zipPath, tmpDir) {
        try {
            await this.zipReader.extract(zipPath, tmpDir);
        } catch (err) {
            throw new ImportError('invalid');
        }
    }

    async _readManifest(tmpDir) {
        let manifest;
        try {
            manifest = JSON.parse(await fs.readFile(path.join(tmpDir, 'session.json'), 'utf8'));
        } catch (err) {
            throw new ImportError('invalid');
        }

        if (!manifest || typeof manifest !== 'object' || manifest.format !== FORMAT) {
            throw new ImportError('invalid');
        }
        if (manifest.version !== VERSION) {
            throw new ImportError('version');
        }
        if (!manifest.workflow || typeof manifest.workflow !== 'object' || !Array.isArray(manifest.steps)) {
            throw new ImportError('invalid');
        }
        return manifest;
    }

    async _buildStep(data, tmpDir, mediaDir, copies) {
        if (!data || typeof data !== 'object') {
            throw new ImportError('step');
        }

        const stepData = {...data, id: randomUUID()};
        delete stepData.createdAt;
        delete stepData.updatedAt;

        if (MEDIA_TYPES.includes(stepData.type)) {
            const relative = await this._resolveMedia(stepData.src, tmpDir);
            const to = path.join(mediaDir, relative.name);
            if (!copies.some((copy) => copy.to === to)) {
                copies.push({from: relative.from, to});
            }
            stepData.src = to;
        }

        try {
            const step = StepFactory.fromData(stepData);
            if (!step) {
                throw new ImportError('step');
            }
            this.validStepUseCase.execute(step);
            return step;
        } catch (err) {
            throw new ImportError('step');
        }
    }

    /**
     * Resolves a manifest src to a real file inside <tmpDir>/media, refusing any escape.
     */
    async _resolveMedia(src, tmpDir) {
        if (typeof src !== 'string' || src === '' || path.isAbsolute(src)) {
            throw new ImportError('invalid');
        }

        const mediaRoot = path.resolve(tmpDir, 'media');
        const resolved = path.resolve(tmpDir, src);
        if (!resolved.startsWith(mediaRoot + path.sep)) {
            throw new ImportError('invalid');
        }

        try {
            const stat = await fs.lstat(resolved);
            if (!stat.isFile()) {
                throw new Error('not a regular file');
            }
            const realRoot = await fs.realpath(mediaRoot);
            const realFile = await fs.realpath(resolved);
            if (!realFile.startsWith(realRoot + path.sep)) {
                throw new Error('escapes media dir');
            }
        } catch (err) {
            throw new ImportError('invalid');
        }

        return {from: resolved, name: path.relative(mediaRoot, resolved)};
    }
}

module.exports = ImportWorkflowUseCase;
