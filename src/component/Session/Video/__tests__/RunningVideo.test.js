import {render, fireEvent, act} from '@testing-library/react';
import RunningVideo from '../RunningVideo';
import VideoTrack from '../../../../entity/VideoTrack';

describe('RunningVideo', () => {
    beforeEach(() => {
        window.electronAPI = {trackChange: jest.fn()};
    });

    it('plays with sound (no muted attribute), unlike the muted dubbing-video player', () => {
        const track = new VideoTrack({src: '/tmp/video.mp4', paused: false});
        const {container} = render(<RunningVideo track={track}/>);

        expect(container.querySelector('video').hasAttribute('muted')).toBe(false);
    });

    it('reflects track.loop onto the native video loop attribute', () => {
        const looping = new VideoTrack({src: '/tmp/video.mp4', paused: false, loop: true});
        const {container: loopingContainer} = render(<RunningVideo track={looping}/>);
        expect(loopingContainer.querySelector('video').loop).toBe(true);

        const notLooping = new VideoTrack({src: '/tmp/video.mp4', paused: false, loop: false});
        const {container: plainContainer} = render(<RunningVideo track={notLooping}/>);
        expect(plainContainer.querySelector('video').loop).toBe(false);
    });

    it('pauses the track when the video ends and looping is off', () => {
        const track = new VideoTrack({src: '/tmp/video.mp4', paused: false, loop: false});
        const {container} = render(<RunningVideo track={track}/>);

        fireEvent.ended(container.querySelector('video'));

        expect(window.electronAPI.trackChange).toHaveBeenCalledWith({paused: true});
    });

    it('does not pause the track when the video ends and looping is on', () => {
        const track = new VideoTrack({src: '/tmp/video.mp4', paused: false, loop: true});
        const {container} = render(<RunningVideo track={track}/>);

        fireEvent.ended(container.querySelector('video'));

        expect(window.electronAPI.trackChange).not.toHaveBeenCalledWith({paused: true});
    });

    it('syncs currentTime/duration over IPC once per second so the regie panel can reflect real playback progress', () => {
        jest.useFakeTimers();
        const track = new VideoTrack({src: '/tmp/video.mp4', paused: false});
        const {container} = render(<RunningVideo track={track}/>);
        const video = container.querySelector('video');
        Object.defineProperty(video, 'currentTime', {value: 5, configurable: true});
        Object.defineProperty(video, 'duration', {value: 120, configurable: true});

        act(() => {
            jest.advanceTimersByTime(1000);
        });

        expect(window.electronAPI.trackChange).toHaveBeenCalledWith({currentTime: 5, duration: 120});
        jest.useRealTimers();
    });
});
