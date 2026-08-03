import {act, renderHook} from '@testing-library/react';
import useTags from '../useTags';

describe('useTags', () => {
    beforeEach(() => {
        window.electronAPI = {tagFetch: jest.fn()};
    });

    it('starts empty and requests tags on mount', () => {
        const {result} = renderHook(() => useTags());

        expect(result.current).toEqual([]);
        expect(window.electronAPI.tagFetch).toHaveBeenCalledTimes(1);
    });

    it('updates when tag-onchange fires', () => {
        const {result} = renderHook(() => useTags());
        act(() => {
            document.dispatchEvent(new CustomEvent('tag-onchange', {detail: [{id: 'tag1'}]}));
        });

        expect(result.current).toEqual([{id: 'tag1'}]);
    });

    it('stops listening after unmount', () => {
        const {unmount} = renderHook(() => useTags());
        unmount();

        expect(() => {
            document.dispatchEvent(new CustomEvent('tag-onchange', {detail: [{id: 'tag1'}]}));
        }).not.toThrow();
    });
});
