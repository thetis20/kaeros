const TrackRepository = require('../../application/port/repository/TrackRepository.js');
const store = require('./store.js');

class TrackStoreRepository extends TrackRepository {
    async create(track) { store.appendToArray('tracks', track) }
    async update(id, track) {
        let tracks = store.get('tracks')
        store.set('tracks', tracks.map(t => t.id === id ? track : t))
    }
    async delete(id) {
        let tracks = store.get('tracks')
        store.set('tracks', tracks.filter(t => t.id !== id))
    }
    async getAll() { return store.get('tracks') || [] }
}
module.exports = TrackStoreRepository;
