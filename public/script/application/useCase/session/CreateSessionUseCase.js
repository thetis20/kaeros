const Session = require("../../entity/Session");
const StepRepository = require("../../port/repository/StepRepository");
const { v4: uuidv4 } = require('uuid');

class CreateSessionUseCase {
    /**
     * @param {StepRepository} stepRepository 
     */
    constructor(
        stepRepository
    ) {
        this.stepRepository = stepRepository;
    }

    /**
     * @param {string} folderId 
     * @return {Session} 
     */
    async execute(workflow) {
        const steps = await this.stepRepository.getByWorkflowId(workflow.id);
        return new Session(uuidv4(), workflow, steps)
    }
}

module.exports = CreateSessionUseCase;