const Workflow = require("../../entity/Workflow");

class ListWorkflowUseCase {

    /**
     * @param {WorkflowRepository} workflowRepository 
     */
    constructor(
        workflowRepository
    ) {
        this.workflowRepository = workflowRepository;
    }

    /**
     * @returns {Promise<Workflow[]>}
     */
    async execute() {
        const workflows = await this.workflowRepository.getAll();

        return workflows.map(workflowData => new Workflow(
            workflowData.id,
            workflowData.name,
            workflowData.color,
            workflowData.createdAt,
            workflowData.updatedAt
        ));
    }
}

module.exports = ListWorkflowUseCase;