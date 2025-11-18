const WorkflowRepository = require("../../port/repository/WorkflowRepository");

class DeleteWorkflowUseCase {

    /**
     * @param {WorkflowRepository} workflowRepository 
     */
    constructor(
        workflowRepository
    ) {
        this.workflowRepository = workflowRepository;
    }

    /**
     * @param {string} id 
     */
    async execute(id) {
        await this.workflowRepository.delete(id);

        return;
    }
}

module.exports = DeleteWorkflowUseCase;