import {act, renderHook} from '@testing-library/react';
import useWorkflows from '../useWorkflows';

describe('useWorkflows', () => {
    beforeEach(() => {
        window.electronAPI = {workflowFetch: jest.fn()};
    });

    it('starts empty and requests workflows on mount', () => {
        const {result} = renderHook(() => useWorkflows());
        expect(result.current).toEqual([]);
        expect(window.electronAPI.workflowFetch).toHaveBeenCalledTimes(1);
    });

    it('updates when workflow-onchange fires', () => {
        const {result} = renderHook(() => useWorkflows());
        act(() => {
            document.dispatchEvent(new CustomEvent('workflow-onchange', {detail: [{id: 'wf-1'}]}));
        });
        expect(result.current).toEqual([{id: 'wf-1'}]);
    });

    it('stops listening after unmount', () => {
        const {unmount} = renderHook(() => useWorkflows());
        unmount();
        expect(() => {
            document.dispatchEvent(new CustomEvent('workflow-onchange', {detail: [{id: 'wf-1'}]}));
        }).not.toThrow();
    });
});
