const Step = require('./Step.js');

class VideoStep extends Step {

    /**
     * @param {string} id
     * @param {string} name
     * @param {string} src
     * @param {boolean} loop
     * @param {date} createdAt
     * @param {date} updatedAt
     */
    constructor(id, name, src, loop, createdAt, updatedAt) {
        super(id, name, "video", createdAt, updatedAt);
        this.src = src;
        this.loop = loop;
    }
}

module.exports = VideoStep
