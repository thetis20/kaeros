import {renderHook} from '@testing-library/react';
import useNavigationGuard from '../useNavigationGuard';

describe('useNavigationGuard', () => {
    it('assigns isDirty and save to the ref, then resets it to null on unmount', () => {
        const guardRef = {current: null};
        const isDirty = () => true;
        const save = () => true;

        const {unmount} = renderHook(() => useNavigationGuard(guardRef, {isDirty, save}));
        expect(guardRef.current).toEqual({isDirty, save});

        unmount();
        expect(guardRef.current).toBeNull();
    });

    it('refreshes the ref on every render', () => {
        const guardRef = {current: null};
        const {rerender} = renderHook(({dirty}) => useNavigationGuard(guardRef, {isDirty: () => dirty, save: () => true}), {
            initialProps: {dirty: false},
        });
        expect(guardRef.current.isDirty()).toBe(false);

        rerender({dirty: true});
        expect(guardRef.current.isDirty()).toBe(true);
    });

    it('does nothing when no ref is given', () => {
        expect(() => renderHook(() => useNavigationGuard(undefined, {isDirty: () => true, save: () => true}))).not.toThrow();
    });
});
