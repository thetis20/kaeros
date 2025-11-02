const FolderRepository = require('../../application/port/repository/FolderRepository.js');
const store = require('./store.js');

class FolderStoreRepository extends FolderRepository {

    async create(folder) {
        store.appendToArray('folders', folder)
    }

    async update(id, folder) {
        let folders = store.get('folders')
        store.set('folders', folders.map(f => f.id === id ? folder : f))
    }

    async delete(id) {
        let folders = store.get('folders')
        store.delete('audios_' + id) // delete audios associated
        store.set('folders', folders.filter(f => f.id !== id))
    }

    async getAll() {
        return store.get('folders')
    }
}

module.exports = FolderStoreRepository;