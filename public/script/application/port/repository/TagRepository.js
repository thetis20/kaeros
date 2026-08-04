class TagRepository {

    /**
     * @param {Tag} tag
     */
    async create(tag) {
        throw new Error("Not implemented");
    }

    /**
     * @returns {Promise<Tag[]>}
     */
    async getAll() {
        throw new Error("Not implemented");
    }

    /**
     * @param {string} id
     */
    async delete(id) {
        throw new Error("Not implemented");
    }
}

module.exports = TagRepository;
