const Track = require('./Track.js');
const { v4: uuidv4 } = require('uuid');

class Player{

    constructor(player) {
        this.id = uuidv4();
        this.name = player
        this.score = 0
        this.enabled = true;
    }
}

class BattleRoyalTrack extends Track {

    /**
     * @param {BattleRoyalStep} step
     */
    constructor(step) {
        super(step);
        this.players = step.players.map((player)=>new Player(player))
    }
}

module.exports = BattleRoyalTrack