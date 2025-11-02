const Audio = require("../../entity/Audio")

class PauseAudioUseCase {
    constructor() {
    }

    /**
     * @param {Audio} audio
     * @return {Audio}
     */
    execute(audio) {
        audio.paused = true
        return audio
    }
}

module.exports = PauseAudioUseCase