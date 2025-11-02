const Folder = require("../../entity/Folder");

class FolderRepository {

    /**
     * @param {Folder} folder 
     */
    async create(folder) {
        throw new Error("Not implemented");
    }

    /**
     * @param {string} id 
     * @param {Folder} folder 
     */
    async update(id, folder) {
        throw new Error("Not implemented");
    }

    /**
     * @param {string} id 
     */
    async delete(id) {
        throw new Error("Not implemented");
    }

    /**
     * @returns {Promise<Folder[]>}
     */
    async getAll() {
        throw new Error("Not implemented");
    }
}

module.exports = FolderRepository;