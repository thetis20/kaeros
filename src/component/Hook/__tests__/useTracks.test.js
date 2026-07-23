import {act, renderHook} from '@testing-library/react';
import useTracks from '../useTracks';

describe('useTracks', () => {
    beforeEach(() => {
        window.electronAPI = {trackFetch: jest.fn()};
    });

    it('starts empty and requests tracks on mount', () => {
        const {result} = renderHook(() => useTracks());

        expect(result.current).toEqual([]);
        expect(window.electronAPI.trackFetch).toHaveBeenCalledTimes(1);
    });

    it('updates when track-onchange fires', () => {
        const {result} = renderHook(() => useTracks());
        act(() => {
            document.dispatchEvent(new CustomEvent('track-onchange', {detail: [{id: 't1'}]}));
        });

        expect(result.current).toEqual([{id: 't1'}]);
    });

    it('stops listening after unmount', () => {
        const {unmount} = renderHook(() => useTracks());
        unmount();

        expect(() => {
            document.dispatchEvent(new CustomEvent('track-onchange', {detail: [{id: 't1'}]}));
        }).not.toThrow();
    });
});
