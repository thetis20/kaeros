import Track from "./Track"

export const STATUS_PRESENTATION = "STATUS_PRESENTATION"
export const STATUS_RUNNING = "STATUS_RUNNING"

export default class TimeTrack extends Track {
    constructor(track) {
        super(track)
        this.impro = track.impro
        this.minutes = track.minutes
        this.count = track.count
        this.time = track.time
        this.paused = track.paused
        this.status = track.status

        this.decrement = this.decrement.bind(this)
    }

    canPlay() {
        return this.paused
    }

    canPause() {
        return !this.paused
    }

    canPlus() {
        return this.count < this.impro
    }

    canMinus() {
        return this.count > 1
    }

    play() {
        window.electronAPI.trackChange({paused: false})
    }

    run() {
        window.electronAPI.trackChange({
            status: STATUS_RUNNING,
            paused: false
        })
    }

    pause() {
        window.electronAPI.trackChange({
            paused: true
        })
    }

    decrement() {
        if (this.time - 1 <= 0) {
            electronAPI.trackChange({
                time: 0,
                paused: true
            })
        } else {
            electronAPI.trackChange({
                time: this.time - 1
            })
        }
    }
}