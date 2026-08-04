import VideoTrack from '../VideoTrack';

describe('VideoTrack', () => {
    beforeEach(() => {
        window.electronAPI = {trackChange: jest.fn()};
    });

    it('defaults loop to false and paused/currentTime/duration to false/0/0 when absent', () => {
        const track = new VideoTrack({src: '/tmp/video.mp4'});
        expect(track.loop).toBe(false);
        expect(track.paused).toBe(false);
        expect(track.currentTime).toBe(0);
        expect(track.duration).toBe(0);
    });

    it('keeps explicit loop/paused/currentTime/duration values', () => {
        const track = new VideoTrack({src: '/tmp/video.mp4', loop: true, paused: true, currentTime: 12.5, duration: 90});
        expect(track.loop).toBe(true);
        expect(track.paused).toBe(true);
        expect(track.currentTime).toBe(12.5);
        expect(track.duration).toBe(90);
    });

    it('canPlay/canPause mirror the paused flag', () => {
        expect(new VideoTrack({paused: true}).canPlay()).toBe(true);
        expect(new VideoTrack({paused: true}).canPause()).toBe(false);
        expect(new VideoTrack({paused: false}).canPlay()).toBe(false);
        expect(new VideoTrack({paused: false}).canPause()).toBe(true);
    });

    it('play()/pause() (inherited from Track) send the expected paused flag', () => {
        new VideoTrack({paused: true}).play();
        expect(window.electronAPI.trackChange).toHaveBeenCalledWith({paused: false});

        new VideoTrack({paused: false}).pause();
        expect(window.electronAPI.trackChange).toHaveBeenCalledWith({paused: true});
    });

    it('setLoop(loop) sends the loop flag over trackChange', () => {
        new VideoTrack({}).setLoop(true);
        expect(window.electronAPI.trackChange).toHaveBeenCalledWith({loop: true});

        new VideoTrack({}).setLoop(false);
        expect(window.electronAPI.trackChange).toHaveBeenCalledWith({loop: false});
    });
});
