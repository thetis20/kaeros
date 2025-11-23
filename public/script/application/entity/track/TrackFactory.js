const ImageTrack = require('./ImageTrack')
const DubbingVideoTrack = require("./DubbingVideoTrack");
const TimeTrack = require("./TimeTrack");

class TrackFactory {

    static fromStep(step) {
        switch (step.type) {
            case 'image':
                return new ImageTrack(step)
            case 'dubbing-video':
                return new DubbingVideoTrack(step)
            case 'time':
                return new TimeTrack(step)
        }
    }

}

module.exports = TrackFactory