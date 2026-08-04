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

        if (track.startOffsetMs === undefined || track.startOffsetMs === null || track.startOffsetMs === '') {
            track.startOffsetMs = 0;
        } else {
            const startOffsetMs = Number(track.startOffsetMs);
            if (!Number.isInteger(startOffsetMs) || startOffsetMs < 0) {
                throw new Error('Invalid track start offset');
            }
            track.startOffsetMs = startOffsetMs;
        }

        return track
    }
}

module.exports = ValidTrackUseCase
