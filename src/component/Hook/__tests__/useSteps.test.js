import {act, renderHook} from '@testing-library/react';
import useSteps from '../useSteps';

describe('useSteps', () => {
    beforeEach(() => {
        window.electronAPI = {stepFetch: jest.fn()};
    });

    it('starts empty and requests steps for the given workflow on mount', () => {
        const {result} = renderHook(() => useSteps('wf-1'));
        expect(result.current).toEqual([]);
        expect(window.electronAPI.stepFetch).toHaveBeenCalledWith('wf-1');
    });

    it('updates when step-onchange fires', () => {
        const {result} = renderHook(() => useSteps('wf-1'));
        act(() => {
            document.dispatchEvent(new CustomEvent('step-onchange', {detail: [{id: 1}, {id: 2}]}));
        });
        expect(result.current).toEqual([{id: 1}, {id: 2}]);
    });

    it('re-fetches when workflowId changes', () => {
        const {rerender} = renderHook(({workflowId}) => useSteps(workflowId), {
            initialProps: {workflowId: 'wf-1'},
        });
        rerender({workflowId: 'wf-2'});
        expect(window.electronAPI.stepFetch).toHaveBeenNthCalledWith(1, 'wf-1');
        expect(window.electronAPI.stepFetch).toHaveBeenNthCalledWith(2, 'wf-2');
    });

    it('stops listening after unmount', () => {
        const {unmount} = renderHook(() => useSteps('wf-1'));
        unmount();
        expect(() => {
            document.dispatchEvent(new CustomEvent('step-onchange', {detail: [{id: 1}]}));
        }).not.toThrow();
    });
});
