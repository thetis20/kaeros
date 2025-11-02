const FolderRepository = require("../../port/repository/FolderRepository");

class DeleteFolderUseCase {

    /**
     * @param {FolderRepository} folderRepository 
     */
    constructor(
        folderRepository
    ) {
        this.folderRepository = folderRepository;
    }

    /**
     * @param {string} id 
     */
    async execute(id) {
        await this.folderRepository.delete(id);

        return;
    }
}

module.exports = DeleteFolderUseCase;