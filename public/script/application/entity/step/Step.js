class Step {

    /**
     * @param {string} id
     * @param {string} name
     * @param {string} type
     * @param {date} createdAt
     * @param {date} updatedAt
     */
    constructor(id, name, type, createdAt, updatedAt) {
        this.id = id;
        this.name = name;
        this.type = type;
        this.createdAt = createdAt || new Date();
        this.updatedAt = updatedAt || new Date();
    }
}

module.exports = Step