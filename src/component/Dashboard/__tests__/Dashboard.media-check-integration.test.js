import '../../../lib/i18n';
import {act, render, screen, fireEvent, waitFor, within} from '@testing-library/react';
import Dashboard from '../Dashboard';
import {checkWorkflowMedia} from '../../../lib/mediaCheck';

jest.mock('../../../lib/mediaCheck', () => {
    const actual = jest.requireActual('../../../lib/mediaCheck');
    return {
        ...actual,
        checkWorkflowMedia: jest.fn(),
    };
});

describe('Dashboard with media check on launch disabled', () => {
    const workflow = {id: 'wf-1', name: 'Remise des diplômes', color: '#378ADD', updatedAt: new Date().toISOString()};

    beforeEach(() => {
        window.electronAPI = {
            workflowFetch: jest.fn(),
            workflowRemove: jest.fn(),
            sessionPlay: jest.fn(),
            trackFetch: jest.fn(),
            tagFetch: jest.fn(),
        };
        delete window.session;
        checkWorkflowMedia.mockReset();
    });

    it('plays directly without checking media from the Régie entry point', () => {
        render(<Dashboard/>);
        act(() => {
            document.dispatchEvent(new CustomEvent('workflow-onchange', {detail: [workflow]}));
        });

        fireEvent.click(screen.getByRole('button', {name: 'Démarrer'}));

        expect(checkWorkflowMedia).not.toHaveBeenCalled();
        expect(window.electronAPI.sessionPlay).toHaveBeenCalledWith(workflow);
        expect(screen.queryByRole('dialog')).toBeNull();
    });
});

// Skipped while MEDIA_CHECK_ON_LAUNCH is false - re-enable together with the flag.
describe.skip('Dashboard media check integration (real RegieScreen and WorkflowDashboard)', () => {
    const workflow = {id: 'wf-1', name: 'Remise des diplômes', color: '#378ADD', updatedAt: new Date().toISOString()};

    beforeEach(() => {
        window.electronAPI = {
            workflowFetch: jest.fn(),
            workflowRemove: jest.fn(),
            sessionPlay: jest.fn(),
            trackFetch: jest.fn(),
            tagFetch: jest.fn(),
        };
        delete window.session;
        checkWorkflowMedia.mockReset();
    });

    function seedWorkflows(workflows) {
        act(() => {
            document.dispatchEvent(new CustomEvent('workflow-onchange', {detail: workflows}));
        });
    }

    it('blocks playback and shows the dialog from the Régie entry point when a media is faulty', async () => {
        checkWorkflowMedia.mockResolvedValue([
            {id: 'e1', kind: 'step', stepId: 's1', name: 'Etape 1', src: '/missing.mp4', code: 'missing'},
        ]);
        render(<Dashboard/>);
        seedWorkflows([workflow]);

        fireEvent.click(screen.getByRole('button', {name: 'Démarrer'}));

        await waitFor(() => expect(screen.getByRole('dialog')).toBeTruthy());
        expect(window.electronAPI.sessionPlay).not.toHaveBeenCalled();
        expect(screen.getByText('La session ne peut pas démarrer')).toBeTruthy();
        expect(screen.getByText(/Etape 1/)).toBeTruthy();
        expect(screen.getByText(/Fichier introuvable : \/missing\.mp4/)).toBeTruthy();
    });

    it('blocks playback and shows the dialog from the Sessions list entry point when a media is faulty', async () => {
        checkWorkflowMedia.mockResolvedValue([
            {id: 'e1', kind: 'audio', name: 'Ambiance', src: '/amb.mp3', code: 'empty'},
        ]);
        render(<Dashboard/>);
        fireEvent.click(screen.getByRole('button', {name: /Sessions/}));
        seedWorkflows([workflow]);

        fireEvent.click(screen.getByRole('button', {name: 'Démarrer'}));

        await waitFor(() => expect(screen.getByRole('dialog')).toBeTruthy());
        expect(window.electronAPI.sessionPlay).not.toHaveBeenCalled();
        expect(screen.getByText(/Ambiance/)).toBeTruthy();
        expect(screen.getByText(/Fichier vide \(0 octet\) : \/amb\.mp3/)).toBeTruthy();
    });

    it('plays directly with no dialog when the media check reports no issues (Régie)', async () => {
        checkWorkflowMedia.mockResolvedValue([{id: 'e1', kind: 'step', name: 'Etape 1', src: '/ok.mp4', code: 'ok'}]);
        render(<Dashboard/>);
        seedWorkflows([workflow]);

        fireEvent.click(screen.getByRole('button', {name: 'Démarrer'}));

        await waitFor(() => expect(window.electronAPI.sessionPlay).toHaveBeenCalledTimes(1));
        expect(window.electronAPI.sessionPlay).toHaveBeenCalledWith(workflow);
        expect(screen.queryByRole('dialog')).toBeNull();
    });

    it('plays directly with no dialog when the media check reports no issues (Sessions list)', async () => {
        checkWorkflowMedia.mockResolvedValue([{id: 'e1', kind: 'step', name: 'Etape 1', src: '/ok.mp4', code: 'ok'}]);
        render(<Dashboard/>);
        fireEvent.click(screen.getByRole('button', {name: /Sessions/}));
        seedWorkflows([workflow]);

        fireEvent.click(screen.getByRole('button', {name: 'Démarrer'}));

        await waitFor(() => expect(window.electronAPI.sessionPlay).toHaveBeenCalledTimes(1));
        expect(window.electronAPI.sessionPlay).toHaveBeenCalledWith(workflow);
        expect(screen.queryByRole('dialog')).toBeNull();
    });

    it('does not play and shows a problem when the media check rejects', async () => {
        checkWorkflowMedia.mockRejectedValue(new Error('disk unavailable'));
        render(<Dashboard/>);
        seedWorkflows([workflow]);

        fireEvent.click(screen.getByRole('button', {name: 'Démarrer'}));

        await waitFor(() => expect(screen.getByRole('dialog')).toBeTruthy());
        expect(window.electronAPI.sessionPlay).not.toHaveBeenCalled();
    });

    it('disables the play button while the check is in flight', async () => {
        let resolveCheck;
        checkWorkflowMedia.mockReturnValue(new Promise((resolve) => {
            resolveCheck = resolve;
        }));
        render(<Dashboard/>);
        seedWorkflows([workflow]);

        fireEvent.click(screen.getByRole('button', {name: 'Démarrer'}));

        expect(screen.getByRole('button', {name: 'Vérification des médias…'})).toBeDisabled();

        await act(async () => {
            resolveCheck([{id: 'e1', kind: 'step', name: 'Etape 1', src: '/ok.mp4', code: 'ok'}]);
        });
    });

    it('closes the dialog with the close button', async () => {
        checkWorkflowMedia.mockResolvedValue([
            {id: 'e1', kind: 'step', name: 'Etape 1', src: '/missing.mp4', code: 'missing'},
        ]);
        render(<Dashboard/>);
        seedWorkflows([workflow]);
        fireEvent.click(screen.getByRole('button', {name: 'Démarrer'}));
        await waitFor(() => expect(screen.getByRole('dialog')).toBeTruthy());

        fireEvent.click(screen.getByRole('button', {name: 'Fermer'}));

        expect(screen.queryByRole('dialog')).toBeNull();
    });

    it('closes the dialog with Escape', async () => {
        checkWorkflowMedia.mockResolvedValue([
            {id: 'e1', kind: 'step', name: 'Etape 1', src: '/missing.mp4', code: 'missing'},
        ]);
        render(<Dashboard/>);
        seedWorkflows([workflow]);
        fireEvent.click(screen.getByRole('button', {name: 'Démarrer'}));
        await waitFor(() => expect(screen.getByRole('dialog')).toBeTruthy());

        fireEvent.keyDown(screen.getByRole('dialog'), {key: 'Escape'});

        expect(screen.queryByRole('dialog')).toBeNull();
    });
});
