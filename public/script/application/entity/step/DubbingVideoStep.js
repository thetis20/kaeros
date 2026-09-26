const Step = require('./Step.js');

class DubbingVideoStep extends Step {

    /**
     * @param {string} id
     * @param {string} name
     * @param {string} src
     * @param {string} description
     * @param {string} time
     * @param {int} startOffsetMs
     * @param {?int} endOffsetMs
     * @param {date} createdAt
     * @param {date} updatedAt
     */
    constructor(id, name, src, description, time, startOffsetMs = 0, endOffsetMs = null, createdAt, updatedAt) {
        super(id, name, "dubbing-video", createdAt, updatedAt);
        this.description = description;
        this.time = time;
        this.src = src;
        this.startOffsetMs = startOffsetMs;
        this.endOffsetMs = endOffsetMs;
    }
}

module.exports = DubbingVideoStep