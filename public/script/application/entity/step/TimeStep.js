const Step = require('./Step.js');

class TimeStep extends Step {
    constructor(id, name, impro, minutes, createdAt, updatedAt) {
        super(id, name, "time", createdAt, updatedAt);
        this.impro = impro;
        this.minutes = minutes;
    }
}

module.exports = TimeStep