const Track = require('./Track.js');

class ImageTrack extends Track {
    constructor(step) {
        super(step);
        this.src = step.src
    }
}

module.exports = ImageTrack