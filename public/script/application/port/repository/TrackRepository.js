const Audio = require("../../entity/Audio");

class TrackRepository {

    /**
     * @param {Audio} track
     */
    async create(track) {
        throw new Error("Not implemented");
    }

    /**
     * @param {string} id
     * @param {Audio} track
     */
    async update(id, track) {
        throw new Error("Not implemented");
    }

    /**
     * @param {string} id
     */
    async delete(id) {
        throw new Error("Not implemented");
    }

    /**
     * @returns {Promise<Audio[]>}
     */
    async getAll() {
        throw new Error("Not implemented");
    }
}

module.exports = TrackRepository;
