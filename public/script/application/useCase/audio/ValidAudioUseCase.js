class ValidAudioUseCase {

    /**
     * @param {Audio} audio
     * @return {Audio}
     */
    execute(audio) {

        if (!audio.name || typeof audio.name !== 'string') {
            throw new Error('Invalid audio name');
        }
        if (!audio.color || typeof audio.color !== 'string') {
            throw new Error('Invalid audio color');
        }

        return audio
    }
}

module.exports = ValidAudioUseCase