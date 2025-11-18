const AudioRepository = require("../../port/repository/AudioRepository"); ``
const ValidAudioUseCase = require("./ValidAudioUseCase");

class UpdateAudioUseCase {
    /**
     * 
     * @param {AudioRepository} audioRepository 
     */
    constructor(
        audioRepository
    ) {
        this.validAudioUseCase = new ValidAudioUseCase();
        this.audioRepository = audioRepository;
    }

    /**
     * @param {string} folderId
     * @param {string} id
     * @param {Audio} audio 
     */
    async execute(folderId, id, audio) {
        this.validAudioUseCase.execute(audio);

        audio.updatedAt = new Date();
        await this.audioRepository.update(folderId, id, audio);
    }
}

module.exports = UpdateAudioUseCase;