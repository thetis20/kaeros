const {sourcesFromStep} = require('../../entity/step/stepMediaSources.js');

class CheckWorkflowMediaUseCase {

    /**
     * @param {import('../step/ListStepByWorkflowUseCase')} listStepByWorkflowUseCase
     * @param {import('../track/ListTrackUseCase')} listTrackUseCase
     * @param {import('./CheckMediaFilesUseCase')} checkMediaFilesUseCase
     */
    constructor(
        listStepByWorkflowUseCase,
        listTrackUseCase,
        checkMediaFilesUseCase
    ) {
        this.listStepByWorkflowUseCase = listStepByWorkflowUseCase;
        this.listTrackUseCase = listTrackUseCase;
        this.checkMediaFilesUseCase = checkMediaFilesUseCase;
    }

    /**
     * @param {string} workflowId
     */
    async execute(workflowId) {
        const steps = await this.listStepByWorkflowUseCase.execute(workflowId);
        const audios = await this.listTrackUseCase.execute();

        const stepItems = steps.flatMap((step) => sourcesFromStep(step));
        const audioItems = audios.map((audio) => ({
            id: audio.id,
            kind: 'audio',
            name: audio.name,
            src: audio.src,
        }));

        return this.checkMediaFilesUseCase.execute([...stepItems, ...audioItems]);
    }
}

module.exports = CheckWorkflowMediaUseCase;