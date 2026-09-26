import {render, fireEvent, act} from '@testing-library/react';
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
});
