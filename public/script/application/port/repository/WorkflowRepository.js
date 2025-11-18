const Workflow = require("../../entity/Workflow");

class WorkflowRepository {

    /**
     * @param {Workflow} workflow 
     */
    async create(workflow) {
        throw new Error("Not implemented");
    }

    /**
     * @param {string} id 
     * @param {Workflow} workflow 
     */
    async update(id, workflow) {
        throw new Error("Not implemented");
    }

    /**
     * @param {string} id 
     */
    async delete(id) {
        throw new Error("Not implemented");
    }

    /**
     * @param {string} workflowId
     * @returns {Promise<Workflow[]>}
     */
    async getByWorkflowId(workflowId) {
        throw new Error("Not implemented");
    }
}

module.exports = WorkflowRepository;