const Step = require('./Step.js');

class ImageStep extends Step {
    constructor(id, name, src, createdAt, updatedAt) {
        super(id, name, "image", createdAt, updatedAt);
        this.src = src;
    }
}

module.exports = ImageStep