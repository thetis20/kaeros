const Workflow = require("../../entity/Workflow");
const ValidWorkflowUseCase = require("./ValidWorkflowUseCase");

class UpdateWorkflowUseCase {
    /**
     * 
     * @param {WorkflowRepository} workflowRepository 
     */
    constructor(
        workflowRepository
    ) {
        this.validWorkflowUseCase = new ValidWorkflowUseCase();
        this.workflowRepository = workflowRepository;
    }

    /**
     * @param {Workflow} workflow 
     * @returns {Promise<Workflow>}
     */
    async execute(workflow) {
        this.validWorkflowUseCase.execute(workflow);
        workflow.updatedAt = new Date();
        await this.workflowRepository.update(workflow.id, workflow);

        return workflow;
    }
}

module.exports = UpdateWorkflowUseCase;