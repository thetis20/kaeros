const { v4: uuidv4 } = require('uuid');

class Track {
    constructor(step) {
        this.id = uuidv4();
        this.type = step.type;
        this.step = step;
        this.startedAt = new Date();
    }
}

module.exports = Track