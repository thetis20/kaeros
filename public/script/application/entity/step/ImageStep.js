const Step = require('./Step.js');

class ImageStep extends Step {

    /**
     * @param {string} id
     * @param {string} name
     * @param {string} src
     * @param {date} createdAt
     * @param {date} updatedAt
     */
    constructor(id, name, src, createdAt, updatedAt) {
        super(id, name, "image", createdAt, updatedAt);
        this.src = src;
    }
}

module.exports = ImageStep