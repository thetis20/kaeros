import Track from "./Track"
import {Dash, Plus, Trash} from "react-bootstrap-icons";
import {STATUS_RUNNING} from "./DubbingVideoTrack";

class Player {

    constructor({id, name, score, enabled}, session) {
        this.id = id;
        this.name = name;
        this.score = score;
        this.enabled = enabled;
        this.session = session

        this.canIncrement = this.canIncrement.bind(this)
        this.canDecrement = this.canDecrement.bind(this)
        this.canDisable = this.canDisable.bind(this)
        this.canEnable = this.canEnable.bind(this)
        this.set = this.set.bind(this)
        this.increment = this.increment.bind(this)
        this.decrement = this.decrement.bind(this)
        this.disable = this.disable.bind(this)
        this.enable = this.enable.bind(this)
    }

    canIncrement() {
        return this.enabled;
    }

    canDecrement() {
        return this.enabled && this.score > 0;
    }

    canDisable() {
        return this.enabled;
    }

    canEnable() {
        return !this.enabled;
    }

    set(value) {
        const players = []
        for (const i in this.session.players) {
            players[i] = {
                id: this.session.players[i].id,
                name: this.session.players[i].name,
                score: this.session.players[i].score,
                enabled: this.session.players[i].enabled,
            }
            if (this.session.players[i].id === this.id) {
                for (const [k, v] of Object.entries(value)) {
                    players[i][k] = v;
                }
            }
        }
        console.log('set', players);
        window.electronAPI.trackChange({
            players
        })
    }

    increment() {
        this.set({
            score: this.score + 1
        })
    }

    decrement() {
        this.set({
            score: this.score - 1
        })
    }

    disable() {
        this.set({
            enabled: false
        })
    }

    enable() {
        this.set({
            enabled: true
        })
    }
}

export default class BattleRoyalTrack extends Track {
    constructor(track) {
        super(track)
        console.log('BattleRoyalTrack', track.players)
        this.players = track.players.map(player => new Player(player, this))
    }
}