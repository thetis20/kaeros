const Audio = require("../../entity/Audio")

class PlayAudioUseCase {
    constructor() {
    }

    /**
     * @param {Audio} audio
     * @return {Audio}
     */
    execute(audio) {
        audio.paused = false
        return audio
    }
}

module.exports = PlayAudioUseCase