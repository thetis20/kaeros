const Track = require('./Track.js');

class DubbingVideoTrack extends Track {
    constructor(step) {
        super(step);
        this.src = step.src
        this.description = step.description
        this.time = step.time
    }
}

module.exports = DubbingVideoTrack