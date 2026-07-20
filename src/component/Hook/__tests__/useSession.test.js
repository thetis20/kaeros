import {act, renderHook} from '@testing-library/react';
import useSession from '../useSession';
import Session from '../../../entity/Session';

describe('useSession', () => {
    afterEach(() => {
        delete window.session;
    });

    it('returns null when no session has ever been broadcast', () => {
        const {result} = renderHook(() => useSession());
        expect(result.current).toBeNull();
    });

    it('seeds from window.session on mount', () => {
        window.session = {steps: [], index: 0};
        const {result} = renderHook(() => useSession());
        expect(result.current).toBeInstanceOf(Session);
    });

    it('updates on session-onchange and mirrors the value onto window.session', () => {
        const {result} = renderHook(() => useSession());
        act(() => {
            document.dispatchEvent(new CustomEvent('session-onchange', {detail: {steps: [1, 2], index: 1}}));
        });
        expect(result.current).toBeInstanceOf(Session);
        expect(result.current.steps).toEqual([1, 2]);
        expect(window.session).toEqual({steps: [1, 2], index: 1});
    });

    it('stops listening after unmount', () => {
        const {unmount} = renderHook(() => useSession());
        unmount();
        expect(() => {
            document.dispatchEvent(new CustomEvent('session-onchange', {detail: {steps: [], index: 0}}));
        }).not.toThrow();
    });
});
