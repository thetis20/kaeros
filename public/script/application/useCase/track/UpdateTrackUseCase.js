const ValidTrackUseCase = require("./ValidTrackUseCase");

class UpdateTrackUseCase {

    /**
     * @param {TrackRepository} trackRepository
     */
    constructor(trackRepository) {
        this.validTrackUseCase = new ValidTrackUseCase();
        this.trackRepository = trackRepository;
    }

    /**
     * @param {string} id
     * @param {Audio} track
     * @returns {Promise<Audio>}
     */
    async execute(id, track) {
        this.validTrackUseCase.execute(track);

        track.updatedAt = new Date();
        await this.trackRepository.update(id, track);

        return track;
    }
}

module.exports = UpdateTrackUseCase;
