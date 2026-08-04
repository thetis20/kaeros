import '../../../lib/i18n';
import {render, screen, fireEvent, act} from '@testing-library/react';
import AudioController from '../AudioController';

describe('AudioController', () => {
    beforeEach(() => {
        window.electronAPI = {trackPlay: jest.fn(), trackEnd: jest.fn()};
    });

    function play(audio) {
        act(() => {
            document.dispatchEvent(new CustomEvent('audio-play', {detail: audio}));
        });
    }

    it('renders nothing when no audio is playing', () => {
        render(<AudioController/>);
        expect(screen.queryByText(/./)).toBeNull();
    });

    it('shows a playing audio and notifies the main process', () => {
        render(<AudioController/>);
        play({id: 'a1', name: 'Track One', src: '/tmp/track1.mp3'});

        expect(screen.getByText('Track One')).toBeTruthy();
        expect(window.electronAPI.trackPlay).toHaveBeenCalledWith('a1');
    });

    it('replaces an already-playing audio sharing the same id instead of duplicating it', () => {
        render(<AudioController/>);
        play({id: 'a1', name: 'Track One', src: '/tmp/track1.mp3'});
        play({id: 'a1', name: 'Track One Remastered', src: '/tmp/track1b.mp3'});

        expect(screen.getAllByText(/Track One/)).toHaveLength(1);
        expect(screen.getByText('Track One Remastered')).toBeTruthy();
    });

    it('stops an audio and notifies the main process when its stop button is clicked', () => {
        render(<AudioController/>);
        play({id: 'a1', name: 'Track One', src: '/tmp/track1.mp3'});

        fireEvent.click(screen.getByRole('button', {name: /stop/i}));

        expect(screen.queryByText('Track One')).toBeNull();
        expect(window.electronAPI.trackEnd).toHaveBeenCalledWith('a1');
    });

    it('seeks to the track startOffsetMs and plays once metadata is loaded', () => {
        render(<AudioController/>);
        play({id: 'a1', name: 'Track One', src: '/tmp/track1.mp3', startOffsetMs: 5000});

        const audioEl = document.querySelector('audio');
        const playSpy = jest.spyOn(audioEl, 'play').mockImplementation(() => Promise.resolve());
        fireEvent(audioEl, new Event('loadedmetadata'));

        expect(audioEl.currentTime).toBe(5);
        expect(playSpy).toHaveBeenCalled();
    });

    it('starts from the beginning when the track has no startOffsetMs', () => {
        render(<AudioController/>);
        play({id: 'a1', name: 'Track One', src: '/tmp/track1.mp3'});

        const audioEl = document.querySelector('audio');
        jest.spyOn(audioEl, 'play').mockImplementation(() => Promise.resolve());
        fireEvent(audioEl, new Event('loadedmetadata'));

        expect(audioEl.currentTime).toBe(0);
    });

    it('stops an audio when an audio-end event is dispatched for it', () => {
        render(<AudioController/>);
        play({id: 'a1', name: 'Track One', src: '/tmp/track1.mp3'});

        act(() => {
            document.dispatchEvent(new CustomEvent('audio-end', {detail: {id: 'a1'}}));
        });

        expect(screen.queryByText('Track One')).toBeNull();
        expect(window.electronAPI.trackEnd).toHaveBeenCalledWith('a1');
    });
});
