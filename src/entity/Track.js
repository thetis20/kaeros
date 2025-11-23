export default class Track {
    constructor({type, name, stratedAt}) {
        this.type = type;
        this.name = name
        this.stratedAt = stratedAt;
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

    plus() {
        if (this.canPlus()) {
            window.electronAPI.trackChange({
                count: this.count + 1
            })
        }
    }

    minus() {
        if (this.canMinus()) {
            window.electronAPI.trackChange({
                count: this.count - 1
            })
        }
    }

    play() {
        if (this.canPlay()) {
            window.electronAPI.trackChange({
                paused: false
            })
        }
    }

    pause() {
        if (this.canPause()) {
            window.electronAPI.trackChange({
                paused: true
            })
        }
    }
}