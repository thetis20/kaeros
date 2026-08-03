const Tag = require("../../entity/Tag");

class ListTagUseCase {

    /**
     * @param {TagRepository} tagRepository
     */
    constructor(tagRepository) {
        this.tagRepository = tagRepository;
    }

    /**
     * @returns {Promise<Tag[]>}
     */
    async execute() {
        const tags = await this.tagRepository.getAll();
        return tags.map(t => new Tag(t.id, t.name, t.color, t.createdAt, t.updatedAt));
    }
}

module.exports = ListTagUseCase;
