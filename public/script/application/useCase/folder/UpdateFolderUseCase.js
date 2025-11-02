const Folder = require("../../entity/Folder");
const ValidFolderUseCase = require("./ValidFolderUseCase");

class UpdateFolderUseCase {
    /**
     * 
     * @param {FolderRepository} folderRepository 
     */
    constructor(
        folderRepository
    ) {
        this.validFolderUseCase = new ValidFolderUseCase();
        this.folderRepository = folderRepository;
    }

    /**
     * 
     * @param {Folder} folder 
     * @returns {Promise<Folder>}
     */
    async execute(folder) {
        this.validFolderUseCase.execute(folder);

        folder.updatedAt = new Date();
        await this.folderRepository.update(folder.id, folder);

        return folder;
    }
}

module.exports = UpdateFolderUseCase;