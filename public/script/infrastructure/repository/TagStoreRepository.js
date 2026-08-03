const TagRepository = require('../../application/port/repository/TagRepository.js');
const store = require('./store.js');

class TagStoreRepository extends TagRepository {
    async create(tag) { store.appendToArray('tags', tag) }
    async getAll() { return store.get('tags') || [] }
}
module.exports = TagStoreRepository;
