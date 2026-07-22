import {act, renderHook} from '@testing-library/react';
import useAudios from '../useAudios';

describe('useAudios', () => {
    it('starts empty', () => {
        const {result} = renderHook(() => useAudios());
        expect(result.current).toEqual([]);
    });

    it('adds a playing audio when audio-play fires', () => {
        const {result} = renderHook(() => useAudios());
        act(() => {
            document.dispatchEvent(new CustomEvent('audio-play', {detail: {id: 'a1', folderId: 'f1', name: 'Track One', src: '/tmp/track1.mp3'}}));
        });
        expect(result.current).toEqual([{id: 'a1', folderId: 'f1', name: 'Track One', src: '/tmp/track1.mp3'}]);
    });

    it('replaces an already-playing audio sharing the same id instead of duplicating it', () => {
        const {result} = renderHook(() => useAudios());
        act(() => {
            document.dispatchEvent(new CustomEvent('audio-play', {detail: {id: 'a1', folderId: 'f1', name: 'Track One', src: '/tmp/track1.mp3'}}));
        });
        act(() => {
            document.dispatchEvent(new CustomEvent('audio-play', {detail: {id: 'a1', folderId: 'f1', name: 'Track One Remastered', src: '/tmp/track1b.mp3'}}));
        });
        expect(result.current).toEqual([{id: 'a1', folderId: 'f1', name: 'Track One Remastered', src: '/tmp/track1b.mp3'}]);
    });

    it('removes an audio when audio-end fires for it', () => {
        const {result} = renderHook(() => useAudios());
        act(() => {
            document.dispatchEvent(new CustomEvent('audio-play', {detail: {id: 'a1', folderId: 'f1', name: 'Track One', src: '/tmp/track1.mp3'}}));
        });
        act(() => {
            document.dispatchEvent(new CustomEvent('audio-end', {detail: {id: 'a1', folderId: 'f1'}}));
        });
        expect(result.current).toEqual([]);
    });

    it('stops listening after unmount', () => {
        const {unmount} = renderHook(() => useAudios());
        unmount();
        expect(() => {
            document.dispatchEvent(new CustomEvent('audio-play', {detail: {id: 'a1', folderId: 'f1', name: 'Track One', src: '/tmp/track1.mp3'}}));
        }).not.toThrow();
    });
});
