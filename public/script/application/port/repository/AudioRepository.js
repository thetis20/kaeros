const Audio = require("../../entity/Audio");

class AudioRepository {

    /**
     * @param {string} folderId 
     * @returns {Promise<Audio[]>}
     */
    async getByFolderId(folderId) {
        throw new Error("Not implemented");
    }

    /**
     * @param {string} folderId 
     * @param {Audio} audio 
     */
    async create(folderId, audio) {
        throw new Error("Not implemented");
    }

    /**
     * @param {string} folderId 
     * @param {string} id 
     * @param {Audio} audio 
     */
    async update(folderId, id, audio) {
        throw new Error("Not implemented");
    }

    /**
     * @param {string} folderId 
     * @param {string} id 
     */
    async delete(folderId, id) {
        throw new Error("Not implemented");
    }
}

module.exports = AudioRepository;