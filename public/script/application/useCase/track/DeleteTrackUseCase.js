class DeleteTrackUseCase {

    /**
     * @param {TrackRepository} trackRepository
     * @param {CleanTagUseCase} cleanTagUseCase
     */
    constructor(trackRepository,cleanTagUseCase) {
        this.trackRepository = trackRepository;
        this.cleanTagUseCase = cleanTagUseCase;
    }

    /**
     * @param {string} id
     */
    async execute(id) {
        await this.trackRepository.delete(id);
        await this.cleanTagUseCase.execute()
    }
}

module.exports = DeleteTrackUseCase;
