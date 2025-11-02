const Audio = require("../../entity/Audio")

class SwitchAudioUseCase {
    constructor() {
    }

    /**
     * @param {Audio} audio
     * @return {Audio}
     */
    execute(audio) {
        audio.paused = !audio.paused
        return audio
    }
}

module.exports = SwitchAudioUseCase