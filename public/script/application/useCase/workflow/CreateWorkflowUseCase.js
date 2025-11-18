const Workflow = require("../../entity/Workflow");
const ValidWorkflowUseCase = require("./ValidWorkflowUseCase");
const WorkflowRepository = require("../../port/repository/WorkflowRepository");

class CreateWorkflowUseCase {
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
     * 
     * @param {Workflow} workflow 
     * @returns {Promise<Workflow>}
     */
    async execute(workflow) {
        this.validWorkflowUseCase.execute(workflow);
        await this.workflowRepository.create(workflow);

        return workflow;
    }
}

module.exports = CreateWorkflowUseCase;