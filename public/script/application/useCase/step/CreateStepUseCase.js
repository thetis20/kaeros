const Step = require("../../entity/step/Step");
const ValidStepUseCase = require("./ValidStepUseCase");
const StepRepository = require("../../port/repository/StepRepository");

class CreateStepUseCase {
    /**
     * 
     * @param {StepRepository} stepRepository 
     */
    constructor(
        stepRepository
    ) {
        this.validStepUseCase = new ValidStepUseCase();
        this.stepRepository = stepRepository;
    }

    /**
     * @param {string} workflowId 
     * @param {Step} step 
     * @param {?int} afterIndex
     * @returns {Promise<Step>}
     */
    async execute(workflowId, step, afterIndex) {
        this.validStepUseCase.execute(step);
        await this.stepRepository.create(workflowId, step, afterIndex);

        return step;
    }
}

module.exports = CreateStepUseCase;