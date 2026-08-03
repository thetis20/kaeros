class ValidTrackUseCase {

    /**
     * @param {Audio} track
     * @return {Audio}
     */
    execute(track) {
        if (!track.name || typeof track.name !== 'string') {
            throw new Error('Invalid track name');
        }

        if (!Array.isArray(track.tags) || track.tags.length === 0) {
            throw new Error('Invalid track tags');
        }

        return track
    }
}

module.exports = ValidTrackUseCase
