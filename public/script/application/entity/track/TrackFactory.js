const ImageTrack = require('./ImageTrack')
const DubbingVideoTrack = require("./DubbingVideoTrack");
const VideoTrack = require("./VideoTrack");
const TimeTrack = require("./TimeTrack");
const BattleRoyalTrack = require("./BattleRoyalTrack");

class TrackFactory {

    static fromStep(step) {
        switch (step.type) {
            case 'image':
                return new ImageTrack(step)
            case 'dubbing-video':
                return new DubbingVideoTrack(step)
            case 'video':
                return new VideoTrack(step)
            case 'time':
                return new TimeTrack(step)
            case 'battle-royal':
                return new BattleRoyalTrack(step)
        }
    }

}

module.exports = TrackFactory