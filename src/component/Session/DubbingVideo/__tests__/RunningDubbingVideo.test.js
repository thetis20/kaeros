import {render, fireEvent} from '@testing-library/react';
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
});
