class Audio {
    constructor(id, name, src, color, createdAt, updatedAt) {
        this.id = id;
        this.name = name;
        this.src = src;
        this.color = color;
        this.createdAt = createdAt || new Date();
        this.updatedAt = updatedAt || new Date();
    }
}

module.exports = Audio