import '../../../lib/i18n';
import {render, screen, fireEvent, act} from '@testing-library/react';
import AudioController from '../AudioController';

describe('AudioController', () => {
    beforeEach(() => {
        window.electronAPI = {audioPlay: jest.fn(), audioEnd: jest.fn()};
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
        play({id: 'a1', folderId: 'f1', name: 'Track One', src: '/tmp/track1.mp3'});

        expect(screen.getByText('Track One')).toBeTruthy();
        expect(window.electronAPI.audioPlay).toHaveBeenCalledWith('f1', 'a1');
    });

    it('replaces an already-playing audio sharing the same id instead of duplicating it', () => {
        render(<AudioController/>);
        play({id: 'a1', folderId: 'f1', name: 'Track One', src: '/tmp/track1.mp3'});
        play({id: 'a1', folderId: 'f1', name: 'Track One Remastered', src: '/tmp/track1b.mp3'});

        expect(screen.getAllByText(/Track One/)).toHaveLength(1);
        expect(screen.getByText('Track One Remastered')).toBeTruthy();
    });

    it('stops an audio and notifies the main process when its stop button is clicked', () => {
        render(<AudioController/>);
        play({id: 'a1', folderId: 'f1', name: 'Track One', src: '/tmp/track1.mp3'});

        fireEvent.click(screen.getByRole('button', {name: /stop/i}));

        expect(screen.queryByText('Track One')).toBeNull();
        expect(window.electronAPI.audioEnd).toHaveBeenCalledWith('f1', 'a1');
    });

    it('stops an audio when an audio-end event is dispatched for it', () => {
        render(<AudioController/>);
        play({id: 'a1', folderId: 'f1', name: 'Track One', src: '/tmp/track1.mp3'});

        act(() => {
            document.dispatchEvent(new CustomEvent('audio-end', {detail: {id: 'a1', folderId: 'f1'}}));
        });

        expect(screen.queryByText('Track One')).toBeNull();
        expect(window.electronAPI.audioEnd).toHaveBeenCalledWith('f1', 'a1');
    });
});
