class Audio {
    constructor(id, name, src, tags, startOffsetMs = 0, createdAt, updatedAt) {
        this.id = id;
        this.name = name;
        this.src = src;
        this.tags = tags;
        this.startOffsetMs = startOffsetMs;
        this.createdAt = createdAt || new Date();
        this.updatedAt = updatedAt || new Date();
    }
}

module.exports = Audio