const AudioRepository = require("../../port/repository/AudioRepository");

class ListAudioByFolderUseCase {

    /**
     * @param {AudioRepository} audioRepository 
     */
    constructor(
        audioRepository
    ) {
        this.audioRepository = audioRepository;
    }

    /**
     * @param {string} folderId 
     * @returns {Promise<Audio[]>}
     */
    async execute(folderId) {
        return await this.audioRepository.getByFolderId(folderId);
    }
}

module.exports = ListAudioByFolderUseCase;