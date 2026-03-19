import Track from "./Track"

export const STATUS_DESCRIPTION = "STATUS_DESCRIPTION"
export const STATUS_RUNNING = "STATUS_RUNNING"

export default class DubbingVideoTrack extends Track {
    constructor(track) {
        super(track)
        this.src = track.src
        this.time = track.time
        this.description = track.description
        this.paused = track.paused || false
        this.status = track.status || STATUS_DESCRIPTION
    }

    canPlay() {
        return this.paused
    }

    canPause() {
        return !this.paused
    }

    play() {
        const changes = {paused: false}
        if (this.status === STATUS_DESCRIPTION) {
            changes.status = STATUS_RUNNING
        }
        window.electronAPI.trackChange(changes)
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
}