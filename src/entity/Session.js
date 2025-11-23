import ImageTrack from "./ImageTrack";
import DubbingVideoTrack from "./DubbingVideoTrack";

export default class Session {
    constructor(session) {
        this.track = session.track;
        this.index = session.index;
        this.steps = session.steps;

        if (this?.track) {
            switch (this.track.type) {
                case 'image':
                    this.track = new ImageTrack(this.track)
                    break;
                case 'dubbing-video':
                    this.track = new DubbingVideoTrack(this.track)
                    break;
            }
        }

        this.hasNext = this.hasNext.bind(this);
        this.hasPrevious = this.hasPrevious.bind(this);
        this.next = this.next.bind(this);
        this.previous = this.previous.bind(this);
        this.toStep = this.toStep.bind(this);
        this.plus = this.plus.bind(this);
        this.minus = this.minus.bind(this);
        this.play = this.play.bind(this);
        this.pause = this.pause.bind(this);
    }

    hasNext(){
        return this.steps.length - 1 > this.index
    }

    hasPrevious(){
        return this.index !== 0
    }

    next() {
        if(this.hasNext()) {
            window.electronAPI.sessionNext()
        }
    }

    previous() {
        if(this.hasPrevious()) {
            window.electronAPI.sessionPrevious()
        }
    }

    toStep(index) {
        window.electronAPI.sessionToStep(index)
    }

    plus() {
        if (this.track.canPlus()) {
            this.track.plus();
        }
    }

    minus() {
        if (this.track.canMinus()) {
            this.track.minus();
        }
    }

    play() {
        if (this.track.canPlay()) {
            this.track.play();
        }
        if (this.track.canPause()) {
            this.track.pause();
        }
    }

    pause() {
        if (this.track.canPause()) {
            this.track.pause();
        }
    }
}