import {render, fireEvent, act, screen} from '@testing-library/react';
import RunningDubbingVideo from '../RunningDubbingVideo';
import DubbingVideoTrack from '../../../../entity/DubbingVideoTrack';

describe('RunningDubbingVideo', () => {
    beforeEach(() => {
        window.electronAPI = {trackChange: jest.fn()};
    });

    it('pauses the track when the video finishes playing', () => {
        const track = new DubbingVideoTrack({src: '/tmp/video.mp4', paused: false});
        const {container} = render(<RunningDubbingVideo track={track}/>);

        fireEvent.ended(container.querySelector('video'));

        expect(window.electronAPI.trackChange).toHaveBeenCalledWith({paused: true});
    });

    it('syncs currentTime/duration over IPC once per second, relative to the extract window, so the regie panel reflects real playback progress', () => {
        jest.useFakeTimers();
        const track = new DubbingVideoTrack({
            src: '/tmp/video.mp4',
            paused: false,
            startOffsetMs: 5000,
            endOffsetMs: 115000
        });
        const {container} = render(<RunningDubbingVideo track={track}/>);
        const video = container.querySelector('video');
        Object.defineProperty(video, 'currentTime', {value: 10, configurable: true});
        Object.defineProperty(video, 'duration', {value: 120, configurable: true});

        act(() => {
            jest.advanceTimersByTime(1000);
        });

        // startSec = 5, endSec = 115 => relative currentTime = 10 - 5 = 5, relative duration = 115 - 5 = 110
        expect(window.electronAPI.trackChange).toHaveBeenCalledWith({currentTime: 5, duration: 110});
        jest.useRealTimers();
    });

    it('skips the IPC sync while video metadata (duration) has not loaded yet', () => {
        jest.useFakeTimers();
        const track = new DubbingVideoTrack({src: '/tmp/video.mp4', paused: false});
        render(<RunningDubbingVideo track={track}/>);

        act(() => {
            jest.advanceTimersByTime(1000);
        });

        expect(window.electronAPI.trackChange).not.toHaveBeenCalled();
        jest.useRealTimers();
    });

    it('seeks to the extract start offset on loadedmetadata so autoPlay does not start from the beginning of the file', () => {
        const track = new DubbingVideoTrack({src: '/tmp/video.mp4', paused: false, startOffsetMs: 95000});
        const {container} = render(<RunningDubbingVideo track={track}/>);
        const video = container.querySelector('video');

        fireEvent.loadedMetadata(video);

        expect(video.currentTime).toBe(95);
    });

    it('pauses the track when timeupdate crosses the extract end offset', () => {
        const track = new DubbingVideoTrack({
            src: '/tmp/video.mp4',
            paused: false,
            startOffsetMs: 0,
            endOffsetMs: 10000
        });
        const {container} = render(<RunningDubbingVideo track={track}/>);
        const video = container.querySelector('video');
        const pauseSpy = jest.spyOn(video, 'pause').mockImplementation(() => {});
        Object.defineProperty(video, 'currentTime', {value: 10, configurable: true});

        fireEvent.timeUpdate(video);

        expect(pauseSpy).toHaveBeenCalled();
        expect(window.electronAPI.trackChange).toHaveBeenCalledWith({paused: true});
    });

    it('does not pause the track on timeupdate when endOffsetMs is null (extract runs to end of file)', () => {
        const track = new DubbingVideoTrack({src: '/tmp/video.mp4', paused: false, startOffsetMs: 0, endOffsetMs: null});
        const {container} = render(<RunningDubbingVideo track={track}/>);
        const video = container.querySelector('video');
        const pauseSpy = jest.spyOn(video, 'pause').mockImplementation(() => {});
        Object.defineProperty(video, 'currentTime', {value: 99999, configurable: true});
        Object.defineProperty(video, 'duration', {value: 120, configurable: true});

        fireEvent.timeUpdate(video);

        expect(pauseSpy).not.toHaveBeenCalled();
        expect(window.electronAPI.trackChange).not.toHaveBeenCalledWith({paused: true});
    });

    it('keeps the fade overlay fully transparent when fadeOutMs is 0, even past the fade zone', () => {
        const track = new DubbingVideoTrack({
            src: '/tmp/video.mp4',
            paused: false,
            startOffsetMs: 0,
            endOffsetMs: 10000,
            fadeOutMs: 0
        });
        const {container} = render(<RunningDubbingVideo track={track}/>);
        const video = container.querySelector('video');
        Object.defineProperty(video, 'currentTime', {value: 10, configurable: true});

        fireEvent.timeUpdate(video);

        expect(screen.getByTestId('black-fade-overlay').style.opacity).toBe('0');
    });

    it('fades the overlay progressively as the extract nears its end offset, reaching full opacity at the end', () => {
        const track = new DubbingVideoTrack({
            src: '/tmp/video.mp4',
            paused: false,
            startOffsetMs: 0,
            endOffsetMs: 10000,
            fadeOutMs: 1000
        });
        const {container} = render(<RunningDubbingVideo track={track}/>);
        const video = container.querySelector('video');

        Object.defineProperty(video, 'currentTime', {value: 9.5, configurable: true});
        fireEvent.timeUpdate(video);
        expect(screen.getByTestId('black-fade-overlay').style.opacity).toBe('0.5');

        Object.defineProperty(video, 'currentTime', {value: 10, configurable: true});
        fireEvent.timeUpdate(video);
        expect(screen.getByTestId('black-fade-overlay').style.opacity).toBe('1');
    });

    it('anchors the fade on the loaded file duration when endOffsetMs is null', () => {
        const track = new DubbingVideoTrack({
            src: '/tmp/video.mp4',
            paused: false,
            startOffsetMs: 0,
            endOffsetMs: null,
            fadeOutMs: 1000
        });
        const {container} = render(<RunningDubbingVideo track={track}/>);
        const video = container.querySelector('video');
        Object.defineProperty(video, 'duration', {value: 120, configurable: true});

        fireEvent.loadedMetadata(video);

        Object.defineProperty(video, 'currentTime', {value: 119.5, configurable: true});
        fireEvent.timeUpdate(video);

        expect(screen.getByTestId('black-fade-overlay').style.opacity).toBe('0.5');
    });

    it('forces the overlay to full opacity when the video ends and a fade is configured', () => {
        const track = new DubbingVideoTrack({
            src: '/tmp/video.mp4',
            paused: false,
            startOffsetMs: 0,
            endOffsetMs: 10000,
            fadeOutMs: 1000
        });
        const {container} = render(<RunningDubbingVideo track={track}/>);
        const video = container.querySelector('video');

        fireEvent.ended(video);

        expect(screen.getByTestId('black-fade-overlay').style.opacity).toBe('1');
    });

    it('starts fully black at mount when a fade-in is configured, before any timeupdate', () => {
        const track = new DubbingVideoTrack({
            src: '/tmp/video.mp4',
            paused: false,
            startOffsetMs: 0,
            endOffsetMs: 10000,
            fadeInMs: 1000
        });
        render(<RunningDubbingVideo track={track}/>);

        expect(screen.getByTestId('black-fade-overlay').style.opacity).toBe('1');
    });

    it('starts fully transparent at mount when fadeInMs is 0', () => {
        const track = new DubbingVideoTrack({
            src: '/tmp/video.mp4',
            paused: false,
            startOffsetMs: 0,
            endOffsetMs: 10000,
            fadeInMs: 0
        });
        render(<RunningDubbingVideo track={track}/>);

        expect(screen.getByTestId('black-fade-overlay').style.opacity).toBe('0');
    });

    it('clears the fade-in overlay progressively as the extract starts, reaching full transparency once the fade-in ends', () => {
        const track = new DubbingVideoTrack({
            src: '/tmp/video.mp4',
            paused: false,
            startOffsetMs: 0,
            endOffsetMs: 10000,
            fadeInMs: 1000,
            fadeOutMs: 0
        });
        const {container} = render(<RunningDubbingVideo track={track}/>);
        const video = container.querySelector('video');

        Object.defineProperty(video, 'currentTime', {value: 0.5, configurable: true});
        fireEvent.timeUpdate(video);
        expect(screen.getByTestId('black-fade-overlay').style.opacity).toBe('0.5');

        Object.defineProperty(video, 'currentTime', {value: 1, configurable: true});
        fireEvent.timeUpdate(video);
        expect(screen.getByTestId('black-fade-overlay').style.opacity).toBe('0');
    });

    it('anchors the fade-in window on startOffsetMs, not on zero', () => {
        const track = new DubbingVideoTrack({
            src: '/tmp/video.mp4',
            paused: false,
            startOffsetMs: 5000,
            endOffsetMs: 115000,
            fadeInMs: 1000,
            fadeOutMs: 0
        });
        const {container} = render(<RunningDubbingVideo track={track}/>);
        const video = container.querySelector('video');

        // still inside the pre-fade-in window relative to the file: no fade-in yet at this raw time
        Object.defineProperty(video, 'currentTime', {value: 5.5, configurable: true});
        fireEvent.timeUpdate(video);
        expect(screen.getByTestId('black-fade-overlay').style.opacity).toBe('0.5');

        Object.defineProperty(video, 'currentTime', {value: 6, configurable: true});
        fireEvent.timeUpdate(video);
        expect(screen.getByTestId('black-fade-overlay').style.opacity).toBe('0');
    });

    it('caps the overlay opacity at the max of both fades, never their sum, when the extract is shorter than fade-in + fade-out combined', () => {
        const track = new DubbingVideoTrack({
            src: '/tmp/video.mp4',
            paused: false,
            startOffsetMs: 0,
            endOffsetMs: 1500,
            fadeInMs: 1000,
            fadeOutMs: 1000
        });
        const {container} = render(<RunningDubbingVideo track={track}/>);
        const video = container.querySelector('video');

        // fade-in window is [0, 1], fade-out window is [0.5, 1.5]: at t=0.75s both give an
        // opacity of 0.25. Their sum (0.5) would be wrong; the max (0.25) is what must be used.
        Object.defineProperty(video, 'currentTime', {value: 0.75, configurable: true});
        fireEvent.timeUpdate(video);
        const opacity = Number(screen.getByTestId('black-fade-overlay').style.opacity);
        expect(opacity).toBeCloseTo(0.25);
        expect(opacity).toBeGreaterThanOrEqual(0);
        expect(opacity).toBeLessThanOrEqual(1);
    });

    it('resets the fade overlay to transparent when the track src changes (component instance reused across dubbing steps), no fade-in configured on the new track', () => {
        const trackA = new DubbingVideoTrack({
            src: '/tmp/a.mp4',
            paused: false,
            startOffsetMs: 0,
            endOffsetMs: 10000,
            fadeOutMs: 1000,
            fadeInMs: 0
        });
        const {container, rerender} = render(<RunningDubbingVideo track={trackA}/>);
        const video = container.querySelector('video');
        Object.defineProperty(video, 'currentTime', {value: 9.5, configurable: true});
        fireEvent.timeUpdate(video);
        expect(screen.getByTestId('black-fade-overlay').style.opacity).toBe('0.5');

        const trackB = new DubbingVideoTrack({
            src: '/tmp/b.mp4',
            paused: false,
            startOffsetMs: 0,
            endOffsetMs: 10000,
            fadeOutMs: 1000,
            fadeInMs: 0
        });
        rerender(<RunningDubbingVideo track={trackB}/>);

        expect(screen.getByTestId('black-fade-overlay').style.opacity).toBe('0');
    });

    it('resets the fade overlay back to black when the track src changes and the new track has a fade-in configured', () => {
        const trackA = new DubbingVideoTrack({
            src: '/tmp/a.mp4',
            paused: false,
            startOffsetMs: 0,
            endOffsetMs: 10000,
            fadeOutMs: 1000,
            fadeInMs: 0
        });
        const {container, rerender} = render(<RunningDubbingVideo track={trackA}/>);
        const video = container.querySelector('video');
        Object.defineProperty(video, 'currentTime', {value: 9.5, configurable: true});
        fireEvent.timeUpdate(video);
        expect(screen.getByTestId('black-fade-overlay').style.opacity).toBe('0.5');

        const trackB = new DubbingVideoTrack({
            src: '/tmp/b.mp4',
            paused: false,
            startOffsetMs: 0,
            endOffsetMs: 10000,
            fadeOutMs: 1000,
            fadeInMs: 1000
        });
        rerender(<RunningDubbingVideo track={trackB}/>);

        expect(screen.getByTestId('black-fade-overlay').style.opacity).toBe('1');
    });
});
