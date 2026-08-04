import Track from "./Track"

export default class VideoTrack extends Track {
    constructor(track) {
        super(track)
        this.src = track.src
        this.loop = track.loop || false
        this.paused = track.paused || false
        this.currentTime = track.currentTime || 0
        this.duration = track.duration || 0
    }

    canPlay() {
        return this.paused
    }

    canPause() {
        return !this.paused
    }

    setLoop(loop) {
        window.electronAPI.trackChange({loop})
    }
}
