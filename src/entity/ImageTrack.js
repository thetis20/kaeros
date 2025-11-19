import Track from "./Track"

export default class ImageTrack extends Track {
    constructor(track) {
        super(track)
        this.src = track.src
    }
}