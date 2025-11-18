const StepRepository = require("../../port/repository/StepRepository");

class DeleteStepUseCase {

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
     * @param {string} id 
     */
    async execute(workflowId, id) {
        await this.stepRepository.delete(workflowId, id);

        return;
    }
}

module.exports = DeleteStepUseCase;