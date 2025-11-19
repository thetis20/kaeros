const Step = require("../../entity/step/Step");

class StepRepository {

    /**
     * @param {string} workflowId 
     * @param {Step} step 
     * @param {?int} afterIndex
     */
    async create(workflowId, step, afterIndex) {
        throw new Error("Not implemented");
    }

    /**
     * @param {string} workflowId 
     * @param {string} id 
     * @param {Step} step 
     */
    async update(workflowId, id, step) {
        throw new Error("Not implemented");
    }

    /**
     * @param {string} workflowId 
     * @param {string} id 
     */
    async delete(workflowId, id) {
        throw new Error("Not implemented");
    }

    /**
     * @param {string} workflowId 
     * @returns Step[]
     */
    async getByWorkflowId(workflowId) {
        throw new Error("Not implemented");
    }
}

module.exports = StepRepository;