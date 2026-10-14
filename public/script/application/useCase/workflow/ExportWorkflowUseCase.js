const path = require('path');
const {sourcesFromStep} = require('../../entity/step/stepMediaSources.js');

const FORMAT = 'kaeros-session';
const VERSION = 1;

class ExportWorkflowUseCase {
    /**
     * @param {{execute: Function}} listWorkflowUseCase
     * @param {{execute: Function}} listStepByWorkflowUseCase
     * @param {{execute: Function}} checkMediaFilesUseCase
     * @param {{write: Function}} zipWriter
     * @param {() => string} getAppVersion
     */
    constructor(listWorkflowUseCase, listStepByWorkflowUseCase, checkMediaFilesUseCase, zipWriter, getAppVersion = () => undefined) {
        this.listWorkflowUseCase = listWorkflowUseCase;
        this.listStepByWorkflowUseCase = listStepByWorkflowUseCase;
        this.checkMediaFilesUseCase = checkMediaFilesUseCase;
        this.zipWriter = zipWriter;
        this.getAppVersion = getAppVersion;
    }

    /**
     * @param {string} workflowId
     * @param {string} destZipPath
     * @returns {Promise<{ok: true, path: string} | {ok: false, issues: object[]} | {ok: false, error: string}>}
     */
    async execute(workflowId, destZipPath) {
        const workflows = await this.listWorkflowUseCase.execute();
        const workflow = workflows.find((w) => w.id === workflowId);
        if (!workflow) {
            return {ok: false, error: 'not-found'};
        }

        const steps = await this.listStepByWorkflowUseCase.execute(workflowId);

        const items = steps.flatMap(sourcesFromStep);
        const results = await this.checkMediaFilesUseCase.execute(items);
        const issues = results.filter((result) => result.code !== 'ok');
        if (issues.length > 0) {
            return {ok: false, issues};
        }

        const relativeBySource = new Map();
        const files = [];
        const manifestSteps = steps.map((step) => {
            const data = JSON.parse(JSON.stringify(step));
            delete data.id;
            delete data.createdAt;
            delete data.updatedAt;
            if (sourcesFromStep(step).length === 0) {
                return data;
            }
            if (!relativeBySource.has(step.src)) {
                const name = `media/${relativeBySource.size + 1}-${path.basename(step.src)}`;
                relativeBySource.set(step.src, name);
                files.push({source: step.src, name});
            }
            data.src = relativeBySource.get(step.src);
            return data;
        });

        const manifest = {
            format: FORMAT,
            version: VERSION,
            appVersion: this.getAppVersion(),
            exportedAt: new Date().toISOString(),
            workflow: {name: workflow.name, color: workflow.color},
            steps: manifestSteps,
        };

        try {
            await this.zipWriter.write(destZipPath, {
                json: {name: 'session.json', content: JSON.stringify(manifest, null, 2)},
                files,
            });
        } catch (err) {
            return {ok: false, error: 'write'};
        }

        return {ok: true, path: destZipPath};
    }
}

ExportWorkflowUseCase.FORMAT = FORMAT;
ExportWorkflowUseCase.VERSION = VERSION;

module.exports = ExportWorkflowUseCase;
