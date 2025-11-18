const StepRepository = require('../../application/port/repository/StepRepository.js');
const store = require('./store.js');
const StepFactory = require('../../application/entity/StepFactory.js')

class StepStoreRepository extends StepRepository {

    /**
     * @param {string} workflowId 
     * @param {Step} step 
     * @param {?int} afterIndex
     */
    async create(workflowId, step, afterIndex) {
        const start = undefined === afterIndex ? 0 : (afterIndex + 1)
        const steps = (store.get('steps_' + workflowId) || [])
        store.set('steps_' + workflowId, steps.toSpliced(start, 0, step))
    }

    /**
     * @param {string} workflowId 
     * @param {string} id 
     * @param {Step} step 
     */
    async update(workflowId, id, step) {
        let steps = store.get('steps_' + workflowId)
        store.set('steps_' + workflowId, steps.map(s => s.id === id ? step : s))
    }

    /**
     * @param {string} workflowId 
     * @param {string} id 
     */
    async delete(workflowId, id) {
        let steps = store.get('steps_' + workflowId)
        store.set('steps_' + workflowId, steps.filter(s => s.id !== id))
    }

    /**
     * @param {string} workflowId 
     * @returns Step[]
     */
    async getByWorkflowId(workflowId) {
        return (store.get('steps_' + workflowId) || []).map(StepFactory.fromData);
    }
}

module.exports = StepStoreRepository;