const Audio = require("../../entity/Audio");
const ValidAudioUseCase = require("./ValidAudioUseCase");

class CreateAudioUseCase {
    /**
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
     * @param {Audio} audio 
     */
    async execute(folderId, audio) {
        this.validAudioUseCase.execute(audio);

        await this.audioRepository.create(folderId, audio);
    }
}

module.exports = CreateAudioUseCase;