const {v4: uuidv4} = require('uuid');
const Audio = require("../../entity/Audio");
const ValidTrackUseCase = require("./ValidTrackUseCase");

class CreateTrackUseCase {

    /**
     * @param {TrackRepository} trackRepository
     */
    constructor(trackRepository) {
        this.validTrackUseCase = new ValidTrackUseCase();
        this.trackRepository = trackRepository;
    }

    /**
     * @param {{name: string, src: string, color: string, tag: string}} track
     * @returns {Promise<Audio>}
     */
    async execute(track) {
        this.validTrackUseCase.execute(track);

        const newTrack = new Audio(uuidv4(), track.name, track.src, track.color, track.tag);
        await this.trackRepository.create(newTrack);

        return newTrack;
    }
}

module.exports = CreateTrackUseCase;
