const Folder = require("../../entity/Folder");
const ValidFolderUseCase = require("./ValidFolderUseCase");

class CreateFolderUseCase {

    /**
     * @param {FolderRepository} folderRepository 
     */
    constructor(
        folderRepository
    ) {
        this.folderRepository = folderRepository;
    }

    /**
     * @returns {Promise<Folder[]>}
     */
    async execute() {
        const folders = await this.folderRepository.getAll();

        return folders.map(folderData => new Folder(
            folderData.id,
            folderData.name,
            folderData.color,
            folderData.createdAt,
            folderData.updatedAt
        ));
    }
}

module.exports = CreateFolderUseCase;