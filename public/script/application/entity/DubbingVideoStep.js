const Step = require('./Step.js');

class DubbingVideoStep extends Step {
    constructor(id, name, description, duration, src) {
        super(id, name, "dubbingVideo");
        this.description = description;
        this.duration = duration;
        this.src = src;
    }
}

module.exports = DubbingVideoStep