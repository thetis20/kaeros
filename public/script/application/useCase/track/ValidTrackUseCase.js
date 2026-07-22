class ValidTrackUseCase {

    /**
     * @param {Audio} track
     * @return {Audio}
     */
    execute(track) {
        if (!track.name || typeof track.name !== 'string') {
            throw new Error('Invalid track name');
        }

        const validTags = ['Musique', 'Bruitage', 'Disco'];
        if (!track.tag || !validTags.includes(track.tag)) {
            throw new Error('Invalid track tag');
        }

        return track
    }
}

module.exports = ValidTrackUseCase
