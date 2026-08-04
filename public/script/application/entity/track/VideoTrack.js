const Track = require('./Track.js');

class VideoTrack extends Track {
    constructor(step) {
        super(step);
        this.src = step.src
        this.loop = !!step.loop
        this.paused = false
        this.currentTime = 0
        this.duration = 0
    }
}

module.exports = VideoTrack
