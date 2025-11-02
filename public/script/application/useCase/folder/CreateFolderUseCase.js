const Folder = require("../../entity/Folder");
const ValidFolderUseCase = require("./ValidFolderUseCase");
const FolderRepository = require("../../port/repository/FolderRepository");

class CreateFolderUseCase {
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

        await this.folderRepository.create(folder);

        return folder;
    }
}

module.exports = CreateFolderUseCase;