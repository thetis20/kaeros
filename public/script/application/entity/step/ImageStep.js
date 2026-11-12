const Step = require('./Step.js');

class ImageStep extends Step {

    /**
     * @param {string} id
     * @param {string} name
     * @param {string} src
     * @param {number} scale integer 0-100 (percent), default 100
     * @param {boolean} background show the background image behind the picture, default true
     * @param {date} createdAt
     * @param {date} updatedAt
     */
    constructor(id, name, src, scale = 100, background = true, createdAt, updatedAt) {
        super(id, name, "image", createdAt, updatedAt);
        this.src = src;
        this.scale = scale;
        this.background = background;
    }
}

module.exports = ImageStep