const Step = require("../../entity/step/Step");
const ValidStepUseCase = require("./ValidStepUseCase");

class UpdateStepUseCase {
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
     * @param {string} id
     * @param {Step} step 
     */
    async execute(workflowId, id, step) {
        this.validStepUseCase.execute(step);

        step.updatedAt = new Date();
        await this.stepRepository.update(workflowId, id, step);
    }
}

module.exports = UpdateStepUseCase;