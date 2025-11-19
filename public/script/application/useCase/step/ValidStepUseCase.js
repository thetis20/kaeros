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

        return step;
    }
}

module.exports = ValidStepUseCase