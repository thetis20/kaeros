const TagRepository = require('../../application/port/repository/TagRepository.js');
const store = require('./store.js');

class TagStoreRepository extends TagRepository {
    async create(tag) { store.appendToArray('tags', tag) }
    async getAll() { return store.get('tags') || [] }
    async delete(id) {
        let tags = store.get('tags')
        store.set('tags', tags.filter(t => t.id !== id))
    }
}
module.exports = TagStoreRepository;
