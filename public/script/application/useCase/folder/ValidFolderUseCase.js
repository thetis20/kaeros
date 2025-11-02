class ValidFolderUseCase {

    /**
     * @param {Folder} folder
     * @return {Folder}
     */
    execute(folder) {

        if (!folder.name || typeof folder.name !== 'string') {
            throw new Error('Invalid folder name');
        }
        if (!folder.color || typeof folder.color !== 'string') {
            throw new Error('Invalid folder color');
        }

        return folder
    }
}

module.exports = ValidFolderUseCase