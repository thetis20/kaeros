const Track = require('./Track.js');

class TimeTrack extends Track {
    constructor(step) {
        super(step);
        this.impro = step.impro
        this.minutes = step.minutes
        this.paused = true
        this.time = step.minutes * 60
        this.count = 1
        this.status = 'STATUS_PRESENTATION'
    }
}

module.exports = TimeTrack