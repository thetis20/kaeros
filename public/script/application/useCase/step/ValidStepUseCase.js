const Step = require("../../entity/step/Step");

class ValidStepUseCase {

    /**
     * @param {Step} step   
     * @return {Step}
     */
    execute(step) {
        if (!step.name || typeof step.name !== 'string') {
            throw new Error('Invalid step name');
        }

        if (step.type === 'dubbing-video') {
            if (step.startOffsetMs === undefined || step.startOffsetMs === null || step.startOffsetMs === '') {
                step.startOffsetMs = 0;
            } else {
                const startOffsetMs = Number(step.startOffsetMs);
                if (!Number.isInteger(startOffsetMs) || startOffsetMs < 0) {
                    throw new Error('Invalid dubbing start offset');
                }
                step.startOffsetMs = startOffsetMs;
            }

            if (step.endOffsetMs === undefined || step.endOffsetMs === null || step.endOffsetMs === '') {
                step.endOffsetMs = null;
            } else {
                const endOffsetMs = Number(step.endOffsetMs);
                if (!Number.isInteger(endOffsetMs) || endOffsetMs < 0) {
                    throw new Error('Invalid dubbing end offset');
                }
                step.endOffsetMs = endOffsetMs;
            }

            if (step.endOffsetMs !== null && step.endOffsetMs <= step.startOffsetMs) {
                throw new Error('Invalid dubbing offsets range');
            }
        }

        return step;
    }
}

module.exports = ValidStepUseCase