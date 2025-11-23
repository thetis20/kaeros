const Step = require('./Step.js');

class DubbingVideoStep extends Step {
    constructor(id, name, src, description, time, createdAt, updatedAt) {
        super(id, name, "dubbing-video", createdAt, updatedAt);
        this.description = description;
        this.time = time;
        this.src = src;
    }
}

module.exports = DubbingVideoStep