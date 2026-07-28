import '../../../lib/i18n';
import {act, render, screen, fireEvent} from '@testing-library/react';
import RegieScreen from '../RegieScreen';

describe('RegieScreen', () => {
    beforeEach(() => {
        window.electronAPI = {
            workflowFetch: jest.fn(),
            sessionPlay: jest.fn(),
            trackPlay: jest.fn(),
            trackEnd: jest.fn(),
            trackChange: jest.fn(),
            sessionNext: jest.fn(),
            sessionPrevious: jest.fn(),
            sessionToStep: jest.fn(),
        };
        delete window.session;
    });

    function seedWorkflows(workflows) {
        act(() => {
            document.dispatchEvent(new CustomEvent('workflow-onchange', {detail: workflows}));
        });
    }

    it('shows the empty state with one card per workflow when no session is running', () => {
        render(<RegieScreen/>);
        seedWorkflows([
            {id: 'wf-1', name: 'Remise des diplômes'},
            {id: 'wf-2', name: 'Gala annuel'},
        ]);

        expect(screen.getByText('Remise des diplômes')).toBeTruthy();
        expect(screen.getByText('Gala annuel')).toBeTruthy();
        expect(screen.getByText('Aucune session en cours. Choisis une session à démarrer.')).toBeTruthy();
        expect(screen.getAllByRole('button', {name: 'Démarrer'})).toHaveLength(2);
    });

    it('starts the session for the workflow whose card was clicked', () => {
        render(<RegieScreen/>);
        const workflow = {id: 'wf-1', name: 'Remise des diplômes'};
        seedWorkflows([workflow]);

        fireEvent.click(screen.getByRole('button', {name: 'Démarrer'}));

        expect(window.electronAPI.sessionPlay).toHaveBeenCalledWith(workflow);
    });

    it('renders the live session controller instead of the empty state once a session is running', () => {
        window.session = {
            track: {type: 'time', paused: true, status: 'STATUS_RUNNING', count: 1, impro: 5},
            steps: [{id: 's1', name: 'Step 1'}],
            index: 0,
        };
        render(<RegieScreen/>);

        expect(screen.queryByText('Aucune session en cours. Choisis une session à démarrer.')).toBeNull();
        expect(screen.getByText('Step 1')).toBeTruthy();
    });

    it('collapses and expands the session card content while keeping the header visible', () => {
        render(<RegieScreen/>);
        seedWorkflows([{id: 'wf-1', name: 'Remise des diplômes'}]);

        expect(screen.getByText('Session')).toBeTruthy();
        expect(screen.getByText('Remise des diplômes')).toBeTruthy();

        fireEvent.click(screen.getByRole('button', {name: 'Réduire la session'}));

        expect(screen.getByText('Session')).toBeTruthy();
        expect(screen.queryByText('Remise des diplômes')).toBeNull();

        fireEvent.click(screen.getByRole('button', {name: 'Afficher la session'}));

        expect(screen.getByText('Remise des diplômes')).toBeTruthy();
    });
});
