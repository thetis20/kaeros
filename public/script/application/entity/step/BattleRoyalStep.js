const Step = require('./Step.js');

class BattleRoyalStep extends Step {
    /**
     * @param {string} id
     * @param {string} name
     * @param {string[]} players
     * @param {date} createdAt
     * @param {date} updatedAt
     */
    constructor(id, name, players, createdAt, updatedAt) {
        super(id, name, "battle-royal", createdAt, updatedAt);
        this.players = players;
    }
}

module.exports = BattleRoyalStep