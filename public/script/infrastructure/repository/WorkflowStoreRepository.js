const WorkflowRepository = require('../../application/port/repository/WorkflowRepository.js');
const store = require('./store.js');

class WorkflowStoreRepository extends WorkflowRepository {

    async create(workflow) {
        store.appendToArray('workflows', workflow)
    }

    async update(id, workflow) {
        let workflows = store.get('workflows')
        store.set('workflows', workflows.map(f => f.id === id ? workflow : f))
    }

    async delete(id) {
        let workflows = store.get('workflows')
        store.delete('steps_' + id) // delete steps associated
        store.set('workflows', workflows.filter(f => f.id !== id))
    }

    async getAll() {
        return store.get('workflows')
    }
}

module.exports = WorkflowStoreRepository;