import {act, renderHook} from '@testing-library/react';
import useStep from '../useStep';

describe('useStep', () => {
    it('returns the initial value untouched', () => {
        const {result} = renderHook(() => useStep({name: 'Intro'}));
        const [value] = result.current;
        expect(value).toEqual({name: 'Intro'});
    });

    it('updates on step-onchange', () => {
        const {result} = renderHook(() => useStep(null));
        act(() => {
            document.dispatchEvent(new CustomEvent('step-onchange', {detail: {name: 'Updated'}}));
        });
        const [value] = result.current;
        expect(value).toEqual({name: 'Updated'});
    });

    it('joins an array of players into a semicolon-separated string', () => {
        const {result} = renderHook(() => useStep(null));
        act(() => {
            document.dispatchEvent(new CustomEvent('step-onchange', {detail: {players: ['Alice', 'Bob']}}));
        });
        const [value] = result.current;
        expect(value.players).toBe('Alice; Bob');
    });

    it('exposes a manual setter as the second tuple element', () => {
        const {result} = renderHook(() => useStep(null));
        act(() => {
            result.current[1]({name: 'Manual'});
        });
        const [value] = result.current;
        expect(value).toEqual({name: 'Manual'});
    });

    it('stops listening after unmount', () => {
        const {unmount} = renderHook(() => useStep(null));
        unmount();
        expect(() => {
            document.dispatchEvent(new CustomEvent('step-onchange', {detail: {name: 'x'}}));
        }).not.toThrow();
    });
});
