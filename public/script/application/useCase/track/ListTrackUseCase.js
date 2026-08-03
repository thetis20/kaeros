const Audio = require("../../entity/Audio");

class ListTrackUseCase {

    /**
     * @param {TrackRepository} trackRepository
     */
    constructor(trackRepository) {
        this.trackRepository = trackRepository;
    }

    /**
     * @returns {Promise<Audio[]>}
     */
    async execute() {
        const tracks = await this.trackRepository.getAll();
        return tracks.map(t => new Audio(t.id, t.name, t.src, t.tags, t.createdAt, t.updatedAt));
    }
}

module.exports = ListTrackUseCase;
