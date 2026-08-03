class ValidTagUseCase {

    /**
     * @param {Tag} tag
     * @return {Tag}
     */
    execute(tag) {
        if (!tag.name || typeof tag.name !== 'string' || !tag.name.trim()) {
            throw new Error('Invalid tag name');
        }

        return tag
    }
}

module.exports = ValidTagUseCase
