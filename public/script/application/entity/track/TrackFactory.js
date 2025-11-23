const ImageTrack = require('./ImageTrack')
const DubbingVideoTrack = require("./DubbingVideoTrack");

class TrackFactory {

    static fromStep(step) {
        switch (step.type) {
            case 'image':
                return new ImageTrack(step)
            case 'dubbing-video':
                return new DubbingVideoTrack(step)
        }
    }

}

module.exports = TrackFactory