import '../../../lib/i18n';
import {act, renderHook} from '@testing-library/react';
import useSessionLaunch from '../useSessionLaunch';
import {checkWorkflowMedia} from '../../../lib/mediaCheck';

jest.mock('../../../lib/mediaCheck', () => ({
    checkWorkflowMedia: jest.fn(),
    hasIssues: jest.fn((results) => results.some((result) => result.code !== 'ok')),
    messageKeyFor: jest.fn((code) => `mediaCheck.error.${code}`),
}));

describe('useSessionLaunch', () => {
    const workflow = {id: 'wf-1', name: 'Remise des diplômes'};

    beforeEach(() => {
        window.electronAPI = {sessionPlay: jest.fn()};
        checkWorkflowMedia.mockReset();
    });

    it('plays directly without checking media by default (check disabled)', async () => {
        const {result} = renderHook(() => useSessionLaunch());

        await act(async () => {
            await result.current.launch(workflow);
        });

        expect(checkWorkflowMedia).not.toHaveBeenCalled();
        expect(window.electronAPI.sessionPlay).toHaveBeenCalledWith(workflow);
        expect(result.current.issues).toEqual([]);
        expect(result.current.checking).toBe(false);
    });

    it('plays the session when the media check reports no issues', async () => {
        checkWorkflowMedia.mockResolvedValue([{id: 'e1', kind: 'step', name: 'Etape 1', src: '/a.mp4', code: 'ok'}]);
        const {result} = renderHook(() => useSessionLaunch({checkMedia: true}));

        await act(async () => {
            await result.current.launch(workflow);
        });

        expect(window.electronAPI.sessionPlay).toHaveBeenCalledWith(workflow);
        expect(result.current.issues).toEqual([]);
        expect(result.current.checking).toBe(false);
    });

    it('does not play and stores the faulty entries when the media check reports issues', async () => {
        const okEntry = {id: 'e1', kind: 'step', name: 'Etape 1', src: '/a.mp4', code: 'ok'};
        const badEntry = {id: 'e2', kind: 'step', name: 'Etape 2', src: '/missing.mp4', code: 'missing'};
        checkWorkflowMedia.mockResolvedValue([okEntry, badEntry]);
        const {result} = renderHook(() => useSessionLaunch({checkMedia: true}));

        await act(async () => {
            await result.current.launch(workflow);
        });

        expect(window.electronAPI.sessionPlay).not.toHaveBeenCalled();
        expect(result.current.issues).toEqual([badEntry]);
        expect(result.current.checking).toBe(false);
    });

    it('does not play and surfaces a problem when the media check rejects', async () => {
        checkWorkflowMedia.mockRejectedValue(new Error('disk error'));
        const {result} = renderHook(() => useSessionLaunch({checkMedia: true}));

        await act(async () => {
            await result.current.launch(workflow);
        });

        expect(window.electronAPI.sessionPlay).not.toHaveBeenCalled();
        expect(result.current.issues.length).toBeGreaterThan(0);
        expect(result.current.checking).toBe(false);
    });

    it('sets checking to true while the check is in flight', async () => {
        let resolveCheck;
        checkWorkflowMedia.mockReturnValue(new Promise((resolve) => {
            resolveCheck = resolve;
        }));
        const {result} = renderHook(() => useSessionLaunch({checkMedia: true}));

        act(() => {
            result.current.launch(workflow);
        });

        expect(result.current.checking).toBe(true);

        await act(async () => {
            resolveCheck([{id: 'e1', kind: 'step', name: 'Etape 1', src: '/a.mp4', code: 'ok'}]);
        });

        expect(result.current.checking).toBe(false);
    });

    it('ignores a concurrent launch call while a check is already in flight', async () => {
        let resolveCheck;
        checkWorkflowMedia.mockReturnValue(new Promise((resolve) => {
            resolveCheck = resolve;
        }));
        const {result} = renderHook(() => useSessionLaunch({checkMedia: true}));

        act(() => {
            result.current.launch(workflow);
            result.current.launch(workflow);
        });

        expect(checkWorkflowMedia).toHaveBeenCalledTimes(1);

        await act(async () => {
            resolveCheck([{id: 'e1', kind: 'step', name: 'Etape 1', src: '/a.mp4', code: 'ok'}]);
        });
    });

    it('clears the issues when dismiss is called', async () => {
        const badEntry = {id: 'e2', kind: 'step', name: 'Etape 2', src: '/missing.mp4', code: 'missing'};
        checkWorkflowMedia.mockResolvedValue([badEntry]);
        const {result} = renderHook(() => useSessionLaunch({checkMedia: true}));

        await act(async () => {
            await result.current.launch(workflow);
        });
        expect(result.current.issues).toEqual([badEntry]);

        act(() => {
            result.current.dismiss();
        });

        expect(result.current.issues).toEqual([]);
    });
});
