const {v4: uuidv4} = require('uuid');
const Tag = require("../../entity/Tag");
const ValidTagUseCase = require("./ValidTagUseCase");
const TAG_COLOR_PALETTE = require("../../entity/tagColorPalette");

class CreateTagUseCase {

    /**
     * @param {TagRepository} tagRepository
     */
    constructor(tagRepository) {
        this.validTagUseCase = new ValidTagUseCase();
        this.tagRepository = tagRepository;
    }

    /**
     * @param {{name: string}} tag
     * @returns {Promise<Tag>}
     */
    async execute(tag) {
        this.validTagUseCase.execute(tag);

        const name = tag.name.trim();
        const existing = await this.tagRepository.getAll();
        const duplicate = existing.find(t => t.name.trim().toLowerCase() === name.toLowerCase());
        if (duplicate) {
            return new Tag(duplicate.id, duplicate.name, duplicate.color, duplicate.createdAt, duplicate.updatedAt);
        }

        const color = TAG_COLOR_PALETTE[existing.length % TAG_COLOR_PALETTE.length];
        const newTag = new Tag(uuidv4(), name, color);
        await this.tagRepository.create(newTag);

        return newTag;
    }
}

module.exports = CreateTagUseCase;
