class Workflow {
    constructor(id, name, color, createdAt, updatedAt) {
        this.id = id;
        this.name = name;
        this.color = color;
        this.createdAt = createdAt || new Date();
        this.updatedAt = updatedAt || new Date();
    }
}

module.exports = Workflow