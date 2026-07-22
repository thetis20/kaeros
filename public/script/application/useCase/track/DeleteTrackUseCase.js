class DeleteTrackUseCase {

    /**
     * @param {TrackRepository} trackRepository
     */
    constructor(trackRepository) {
        this.trackRepository = trackRepository;
    }

    /**
     * @param {string} id
     */
    async execute(id) {
        await this.trackRepository.delete(id);
    }
}

module.exports = DeleteTrackUseCase;
