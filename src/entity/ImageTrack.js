import Track from "./Track"

export default class ImageTrack extends Track {
    constructor(track) {
        super(track)
        this.src = track.src
        this.scale = track.scale === undefined ? 100 : track.scale
    }
}