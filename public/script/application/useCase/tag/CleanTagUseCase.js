class CleanTagUseCase {

    /**
     * @param {TagRepository} tagRepository
     * @param {TrackRepository} trackRepository
     */
    constructor(tagRepository, trackRepository) {
        this.tagRepository = tagRepository;
        this.trackRepository = trackRepository;
    }

    async execute() {
        const tags = await this.tagRepository.getAll()
        const tracks = await this.trackRepository.getAll();
        const usedTags = [...new Set([...tracks.map(t => t.tags)].flat())]
        const tagToRemove = tags.filter(t => !usedTags.includes(t.id))
        for (const tag of tagToRemove) {
            await this.tagRepository.delete(tag.id);
        }
    }
}

module.exports = CleanTagUseCase;
