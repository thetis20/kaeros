const Audio = require('../../application/entity/Audio.js');
const AudioRepository = require('../../application/port/repository/AudioRepository.js');
const store = require('./store.js');

class AudioStoreRepository extends AudioRepository {

    /**
     * @param {string} folderId 
     * @param {Audio} audio 
     */
    async create(folderId, audio) {
        store.appendToArray('audios_' + folderId, audio)
    }

    /**
     * @param {string} folderId 
     * @param {string} id 
     * @param {Audio} audio 
     */
    async update(folderId, id, audio) {
        let audios = store.get('audios_' + folderId)
        store.set('audios_' + folderId, audios.map(a => a.id === id ? audio : a))
    }

    /**
     * @param {string} folderId 
     * @param {string} id 
     */
    async delete(folderId, id) {
        let audios = store.get('audios_' + folderId)
        store.set('audios_' + folderId, audios.filter(a => a.id !== id))
    }

    async getByFolderId(folderId) {
        return (store.get('audios_' + folderId) || []).map(a => new Audio(a.id, a.name, a.src, a.color, a.createdAt, a.updatedAt));
    }
}

module.exports = AudioStoreRepository;