const ImageTrack = require('./ImageTrack')

class TrackFactory {

    static fromStep(step) {
        switch (step.type) {
            case 'image':
                return new ImageTrack(step)
        }
    }

}

module.exports = TrackFactory