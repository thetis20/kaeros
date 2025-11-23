const Step = require('./Step.js');

class TimeStep extends Step {

    /**
     * @param {string} id
     * @param {string} name
     * @param {number} impro
     * @param {number} minutes
     * @param {date} createdAt
     * @param {date} updatedAt
     */
    constructor(id, name, impro, minutes, createdAt, updatedAt) {
        super(id, name, "time", createdAt, updatedAt);
        this.impro = impro;
        this.minutes = minutes;
    }
}

module.exports = TimeStep