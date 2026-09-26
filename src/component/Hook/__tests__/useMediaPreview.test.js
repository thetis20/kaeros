import { act, fireEvent, renderHook } from '@testing-library/react';
import useMediaPreview from '../useMediaPreview';

function createMediaElement() {
    const el = document.createElement('audio');
    el.load = jest.fn();
    return el;
}

function attach(result) {
    const mediaEl = createMediaElement();
    act(() => {
        result.current.mediaRef.current = mediaEl;
    });
    return mediaEl;
}

describe('useMediaPreview', () => {
    beforeEach(() => {
        global.URL.createObjectURL = jest.fn(() => 'blob:mock-url');
        global.URL.revokeObjectURL = jest.fn();
    });

    it('seeks to the start offset and plays once metadata is loaded', () => {
        const { result } = renderHook(() => useMediaPreview());
        const mediaEl = attach(result);
        const playSpy = jest.spyOn(mediaEl, 'play').mockImplementation(() => Promise.resolve());
        const file = new File(['sound'], 'track.mp3', { type: 'audio/mpeg' });

        act(() => {
            result.current.play({ file, startOffsetMs: 250 });
        });
        fireEvent(mediaEl, new Event('loadedmetadata'));

        expect(global.URL.createObjectURL).toHaveBeenCalledWith(file);
        expect(mediaEl.currentTime).toBe(0.25);
        expect(playSpy).toHaveBeenCalledTimes(1);
    });

    it('pauses once currentTime reaches the end offset', () => {
        const { result } = renderHook(() => useMediaPreview());
        const mediaEl = attach(result);
        jest.spyOn(mediaEl, 'play').mockImplementation(() => Promise.resolve());
        const pauseSpy = jest.spyOn(mediaEl, 'pause').mockImplementation(() => {});
        const file = new File(['video'], 'clip.mp4', { type: 'video/mp4' });

        act(() => {
            result.current.play({ file, startOffsetMs: 0, endOffsetMs: 4000 });
        });
        fireEvent(mediaEl, new Event('loadedmetadata'));

        mediaEl.currentTime = 3.9;
        fireEvent(mediaEl, new Event('timeupdate'));
        expect(pauseSpy).not.toHaveBeenCalled();

        mediaEl.currentTime = 4;
        fireEvent(mediaEl, new Event('timeupdate'));
        expect(pauseSpy).toHaveBeenCalledTimes(1);

        // the timeupdate listener removes itself once it has paused
        mediaEl.currentTime = 5;
        fireEvent(mediaEl, new Event('timeupdate'));
        expect(pauseSpy).toHaveBeenCalledTimes(1);
    });

    it('never pauses when no end offset is provided', () => {
        const { result } = renderHook(() => useMediaPreview());
        const mediaEl = attach(result);
        jest.spyOn(mediaEl, 'play').mockImplementation(() => Promise.resolve());
        const pauseSpy = jest.spyOn(mediaEl, 'pause').mockImplementation(() => {});
        const file = new File(['sound'], 'track.mp3', { type: 'audio/mpeg' });

        act(() => {
            result.current.play({ file, startOffsetMs: 0 });
        });
        fireEvent(mediaEl, new Event('loadedmetadata'));

        mediaEl.currentTime = 99999;
        fireEvent(mediaEl, new Event('timeupdate'));

        expect(pauseSpy).not.toHaveBeenCalled();
    });

    it('does not stack a second play() when play() is called again before metadata has loaded', () => {
        const { result } = renderHook(() => useMediaPreview());
        const mediaEl = attach(result);
        const file = new File(['sound'], 'track.mp3', { type: 'audio/mpeg' });

        act(() => {
            result.current.play({ file, startOffsetMs: 0 });
            result.current.play({ file, startOffsetMs: 0 });
        });

        const playSpy = jest.spyOn(mediaEl, 'play').mockImplementation(() => Promise.resolve());
        fireEvent(mediaEl, new Event('loadedmetadata'));

        expect(playSpy).toHaveBeenCalledTimes(1);
    });

    it('revokes the previous blob url when starting a new playback', () => {
        const { result } = renderHook(() => useMediaPreview());
        const mediaEl = attach(result);
        jest.spyOn(mediaEl, 'play').mockImplementation(() => Promise.resolve());
        const file1 = new File(['sound'], 'track1.mp3', { type: 'audio/mpeg' });
        const file2 = new File(['sound'], 'track2.mp3', { type: 'audio/mpeg' });

        global.URL.createObjectURL.mockReturnValueOnce('blob:one').mockReturnValueOnce('blob:two');

        act(() => {
            result.current.play({ file: file1, startOffsetMs: 0 });
        });
        act(() => {
            result.current.play({ file: file2, startOffsetMs: 0 });
        });

        expect(global.URL.revokeObjectURL).toHaveBeenCalledWith('blob:one');
    });

    it('revokes the blob url on unmount', () => {
        const { result, unmount } = renderHook(() => useMediaPreview());
        const mediaEl = attach(result);
        jest.spyOn(mediaEl, 'play').mockImplementation(() => Promise.resolve());
        const file = new File(['sound'], 'track.mp3', { type: 'audio/mpeg' });

        act(() => {
            result.current.play({ file, startOffsetMs: 0 });
        });

        unmount();

        expect(global.URL.revokeObjectURL).toHaveBeenCalledWith('blob:mock-url');
    });

    it('does not leave the play() promise unhandled when playback is interrupted by a pause', () => {
        const { result } = renderHook(() => useMediaPreview());
        const mediaEl = attach(result);
        const file = new File(['sound'], 'track.mp3', { type: 'audio/mpeg' });

        act(() => {
            result.current.play({ file, startOffsetMs: 0 });
        });

        const rejectedPlayResult = { catch: jest.fn(() => rejectedPlayResult) };
        jest.spyOn(mediaEl, 'play').mockReturnValue(rejectedPlayResult);

        fireEvent(mediaEl, new Event('loadedmetadata'));

        expect(rejectedPlayResult.catch).toHaveBeenCalled();
    });

    describe('play(value, resolveWindow)', () => {
        it('calls resolveWindow with the loaded media duration only after loadedmetadata', () => {
            const { result } = renderHook(() => useMediaPreview());
            const mediaEl = attach(result);
            jest.spyOn(mediaEl, 'play').mockImplementation(() => Promise.resolve());
            const file = new File(['sound'], 'track.mp3', { type: 'audio/mpeg' });
            const resolveWindow = jest.fn(() => ({ startSec: 1, endSec: null }));

            act(() => {
                result.current.play({ file, startOffsetMs: 250 }, resolveWindow);
            });
            expect(resolveWindow).not.toHaveBeenCalled();

            Object.defineProperty(mediaEl, 'duration', { value: 42, configurable: true });
            fireEvent(mediaEl, new Event('loadedmetadata'));

            expect(resolveWindow).toHaveBeenCalledTimes(1);
            expect(resolveWindow).toHaveBeenCalledWith(42);
        });

        it('seeks to the startSec returned by resolveWindow', () => {
            const { result } = renderHook(() => useMediaPreview());
            const mediaEl = attach(result);
            jest.spyOn(mediaEl, 'play').mockImplementation(() => Promise.resolve());
            const file = new File(['sound'], 'track.mp3', { type: 'audio/mpeg' });
            const resolveWindow = jest.fn(() => ({ startSec: 3.5, endSec: null }));

            act(() => {
                result.current.play({ file, startOffsetMs: 0 }, resolveWindow);
            });
            fireEvent(mediaEl, new Event('loadedmetadata'));

            expect(mediaEl.currentTime).toBe(3.5);
        });

        it('pauses at the endSec returned by resolveWindow', () => {
            const { result } = renderHook(() => useMediaPreview());
            const mediaEl = attach(result);
            jest.spyOn(mediaEl, 'play').mockImplementation(() => Promise.resolve());
            const pauseSpy = jest.spyOn(mediaEl, 'pause').mockImplementation(() => {});
            const file = new File(['video'], 'clip.mp4', { type: 'video/mp4' });
            const resolveWindow = jest.fn(() => ({ startSec: 25, endSec: 30 }));

            act(() => {
                result.current.play({ file, startOffsetMs: 0 }, resolveWindow);
            });
            fireEvent(mediaEl, new Event('loadedmetadata'));

            mediaEl.currentTime = 29;
            fireEvent(mediaEl, new Event('timeupdate'));
            expect(pauseSpy).not.toHaveBeenCalled();

            mediaEl.currentTime = 30;
            fireEvent(mediaEl, new Event('timeupdate'));
            expect(pauseSpy).toHaveBeenCalledTimes(1);
        });

        it('never pauses when resolveWindow returns a null endSec', () => {
            const { result } = renderHook(() => useMediaPreview());
            const mediaEl = attach(result);
            jest.spyOn(mediaEl, 'play').mockImplementation(() => Promise.resolve());
            const pauseSpy = jest.spyOn(mediaEl, 'pause').mockImplementation(() => {});
            const file = new File(['sound'], 'track.mp3', { type: 'audio/mpeg' });
            const resolveWindow = jest.fn(() => ({ startSec: 25, endSec: null }));

            act(() => {
                result.current.play({ file, startOffsetMs: 0 }, resolveWindow);
            });
            fireEvent(mediaEl, new Event('loadedmetadata'));

            mediaEl.currentTime = 99999;
            fireEvent(mediaEl, new Event('timeupdate'));
            expect(pauseSpy).not.toHaveBeenCalled();
        });

        it('behaves exactly like play(value) without a resolver: seeks to the start offset', () => {
            const { result } = renderHook(() => useMediaPreview());
            const mediaEl = attach(result);
            const playSpy = jest.spyOn(mediaEl, 'play').mockImplementation(() => Promise.resolve());
            const file = new File(['sound'], 'track.mp3', { type: 'audio/mpeg' });

            act(() => {
                result.current.play({ file, startOffsetMs: 250 });
            });
            fireEvent(mediaEl, new Event('loadedmetadata'));

            expect(mediaEl.currentTime).toBe(0.25);
            expect(playSpy).toHaveBeenCalledTimes(1);
        });

        it('behaves exactly like play(value) without a resolver: pauses at the plain end offset', () => {
            const { result } = renderHook(() => useMediaPreview());
            const mediaEl = attach(result);
            jest.spyOn(mediaEl, 'play').mockImplementation(() => Promise.resolve());
            const pauseSpy = jest.spyOn(mediaEl, 'pause').mockImplementation(() => {});
            const file = new File(['video'], 'clip.mp4', { type: 'video/mp4' });

            act(() => {
                result.current.play({ file, startOffsetMs: 0, endOffsetMs: 4000 });
            });
            fireEvent(mediaEl, new Event('loadedmetadata'));

            mediaEl.currentTime = 4;
            fireEvent(mediaEl, new Event('timeupdate'));
            expect(pauseSpy).toHaveBeenCalledTimes(1);
        });
    });
});
