const Step = require("../../entity/step/Step");
const StepRepository = require("../../port/repository/StepRepository");

class ListStepByWorkflowUseCase {

    /**
     * @param {StepRepository} stepRepository 
     */
    constructor(
        stepRepository
    ) {
        this.stepRepository = stepRepository;
    }

    /**
     * @param {string} workflowId 
     * @returns {Promise<Step[]>}
     */
    async execute(workflowId) {
        return await this.stepRepository.getByWorkflowId(workflowId);
    }
}

module.exports = ListStepByWorkflowUseCase;