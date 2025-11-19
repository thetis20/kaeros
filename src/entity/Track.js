export default class Track {
    constructor(track) {
        this.type = track.type;
        this.startedAt = track.strartedAt;
    }

    canPlay() {
        return false
    }

    canPause() {
        return false
    }

    canPlus() {
        return false
    }

    canMinus() {
        return false
    }
}