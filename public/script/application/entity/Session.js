const TrackFactory = require("./track/TrackFactory");

class Session {
    constructor(id, workflow, steps) {
        this.id = id;
        this.workflow = workflow;
        this.index = 0;
        this.steps = steps;
        this.startedAt = new Date();
        this.track = TrackFactory.fromStep(steps[0])
    }
}

module.exports = Session