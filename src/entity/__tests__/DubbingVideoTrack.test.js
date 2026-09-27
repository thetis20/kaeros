import DubbingVideoTrack, {STATUS_DESCRIPTION, STATUS_RUNNING} from '../DubbingVideoTrack';

describe('DubbingVideoTrack', () => {
    beforeEach(() => {
        window.electronAPI = {trackChange: jest.fn()};
    });

    it('defaults paused to false and status to STATUS_DESCRIPTION when absent', () => {
        const track = new DubbingVideoTrack({src: '/tmp/video.mp4', time: 0, description: 'Intro'});
        expect(track.paused).toBe(false);
        expect(track.status).toBe(STATUS_DESCRIPTION);
    });

    it('keeps explicit paused/status values', () => {
        const track = new DubbingVideoTrack({paused: true, status: STATUS_RUNNING});
        expect(track.paused).toBe(true);
        expect(track.status).toBe(STATUS_RUNNING);
    });

    it('canPlay/canPause mirror the paused flag', () => {
        expect(new DubbingVideoTrack({paused: true}).canPlay()).toBe(true);
        expect(new DubbingVideoTrack({paused: true}).canPause()).toBe(false);
        expect(new DubbingVideoTrack({paused: false}).canPlay()).toBe(false);
        expect(new DubbingVideoTrack({paused: false}).canPause()).toBe(true);
    });

    it('play() advances STATUS_DESCRIPTION to STATUS_RUNNING and unpauses', () => {
        new DubbingVideoTrack({status: STATUS_DESCRIPTION}).play();
        expect(window.electronAPI.trackChange).toHaveBeenCalledWith({paused: false, status: STATUS_RUNNING});
    });

    it('play() leaves status untouched once already running', () => {
        new DubbingVideoTrack({status: STATUS_RUNNING}).play();
        expect(window.electronAPI.trackChange).toHaveBeenCalledWith({paused: false});
    });

    it('run() switches to running and unpauses', () => {
        new DubbingVideoTrack({}).run();
        expect(window.electronAPI.trackChange).toHaveBeenCalledWith({status: STATUS_RUNNING, paused: false});
    });

    it('pause() pauses', () => {
        new DubbingVideoTrack({}).pause();
        expect(window.electronAPI.trackChange).toHaveBeenCalledWith({paused: true});
    });

    it('captures currentTime/duration when present, defaulting both to 0', () => {
        const track = new DubbingVideoTrack({src: '/tmp/video.mp4', currentTime: 12.5, duration: 90});
        expect(track.currentTime).toBe(12.5);
        expect(track.duration).toBe(90);

        const empty = new DubbingVideoTrack({});
        expect(empty.currentTime).toBe(0);
        expect(empty.duration).toBe(0);
    });

    it('captures startOffsetMs/endOffsetMs when present, defaulting to 0 and null', () => {
        const track = new DubbingVideoTrack({src: '/tmp/video.mp4', startOffsetMs: 250, endOffsetMs: 5000});
        expect(track.startOffsetMs).toBe(250);
        expect(track.endOffsetMs).toBe(5000);

        const empty = new DubbingVideoTrack({});
        expect(empty.startOffsetMs).toBe(0);
        expect(empty.endOffsetMs).toBeNull();
    });

    it('captures fadeOutMs when present, defaulting to 1000, and keeps an explicit 0 as a hard cut', () => {
        expect(new DubbingVideoTrack({src: '/tmp/video.mp4', fadeOutMs: 2500}).fadeOutMs).toBe(2500);
        expect(new DubbingVideoTrack({}).fadeOutMs).toBe(1000);
        expect(new DubbingVideoTrack({fadeOutMs: 0}).fadeOutMs).toBe(0);
    });

    it('captures fadeInMs when present, defaulting to 1000, and keeps an explicit 0 as a hard cut', () => {
        expect(new DubbingVideoTrack({src: '/tmp/video.mp4', fadeInMs: 2500}).fadeInMs).toBe(2500);
        expect(new DubbingVideoTrack({}).fadeInMs).toBe(1000);
        expect(new DubbingVideoTrack({fadeInMs: 0}).fadeInMs).toBe(0);
    });
});
