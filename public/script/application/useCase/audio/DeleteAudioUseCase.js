const AudioRepository = require("../../port/repository/AudioRepository");

class DeleteAudioUseCase {

    /**
     * @param {AudioRepository} audioRepository 
     */
    constructor(
        audioRepository
    ) {
        this.audioRepository = audioRepository;
    }

    /**
     * @param {string} id 
     */
    async execute(id) {
        await this.audioRepository.delete(id);

        return;
    }
}

module.exports = DeleteAudioUseCase;