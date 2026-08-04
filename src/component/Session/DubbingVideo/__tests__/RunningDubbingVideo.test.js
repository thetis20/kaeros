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

    it('syncs currentTime/duration over IPC once per second so the regie panel can reflect real playback progress', () => {
        jest.useFakeTimers();
        const track = new DubbingVideoTrack({src: '/tmp/video.mp4', paused: false});
        const {container} = render(<RunningDubbingVideo track={track}/>);
        const video = container.querySelector('video');
        Object.defineProperty(video, 'currentTime', {value: 5, configurable: true});
        Object.defineProperty(video, 'duration', {value: 120, configurable: true});

        act(() => {
            jest.advanceTimersByTime(1000);
        });

        expect(window.electronAPI.trackChange).toHaveBeenCalledWith({currentTime: 5, duration: 120});
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
});
