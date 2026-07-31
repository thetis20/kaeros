import '../../../lib/i18n';
import {act, render, screen, fireEvent} from '@testing-library/react';
import SessionCreationScreen from '../SessionCreationScreen';

describe('SessionCreationScreen - new session, local step list', () => {
    beforeEach(() => {
        window.electronAPI = {
            workflowFetch: jest.fn(),
            stepFetch: jest.fn(),
            workflowSave: jest.fn(),
            stepSave: jest.fn(),
            stepRemove: jest.fn(),
        };
    });

    it('starts empty and lets the user type a name', () => {
        render(<SessionCreationScreen workflowId={null} onDone={() => {}}/>);
        const nameInput = screen.getByLabelText('Nom de la session');
        fireEvent.change(nameInput, {target: {value: 'Remise des diplômes'}});
        expect(nameInput.value).toBe('Remise des diplômes');
    });

    it('adds a step of each type to the end of the list', () => {
        render(<SessionCreationScreen workflowId={null} onDone={() => {}}/>);
        fireEvent.click(screen.getByRole('button', {name: 'Image'}));
        fireEvent.click(screen.getByRole('button', {name: 'Vidéo de doublage'}));

        expect(screen.getByText('Nouvelle image')).toBeTruthy();
        expect(screen.getByText('Nouveau doublage')).toBeTruthy();
    });

    it('moves a step up and down with the chevron buttons', () => {
        render(<SessionCreationScreen workflowId={null} onDone={() => {}}/>);
        fireEvent.click(screen.getByRole('button', {name: 'Image'}));
        fireEvent.click(screen.getByRole('button', {name: 'Time'}));

        const order = () => screen.getAllByText(/^(Nouvelle image|Nouveau time)$/).map(el => el.textContent);
        expect(order()).toEqual(['Nouvelle image', 'Nouveau time']);

        fireEvent.click(screen.getAllByRole('button', {name: 'Descendre'})[0]);
        expect(order()).toEqual(['Nouveau time', 'Nouvelle image']);

        fireEvent.click(screen.getAllByRole('button', {name: 'Monter'})[1]);
        expect(order()).toEqual(['Nouvelle image', 'Nouveau time']);
    });

    it('deletes a step from the list', () => {
        render(<SessionCreationScreen workflowId={null} onDone={() => {}}/>);
        fireEvent.click(screen.getByRole('button', {name: 'Image'}));
        expect(screen.getByText('Nouvelle image')).toBeTruthy();

        fireEvent.click(screen.getByRole('button', {name: "Supprimer l'étape"}));
        expect(screen.queryByText('Nouvelle image')).toBeNull();
    });

    it('toggles the inline editor open and closed, rendering the matching variant fieldset', () => {
        render(<SessionCreationScreen workflowId={null} onDone={() => {}}/>);
        fireEvent.click(screen.getByRole('button', {name: 'Time'}));
        expect(screen.queryByLabelText("Nombre d'impros")).toBeNull();

        fireEvent.click(screen.getByRole('button', {name: "Modifier l'étape"}));
        expect(screen.getByLabelText("Nombre d'impros")).toBeTruthy();

        fireEvent.click(screen.getByRole('button', {name: "Modifier l'étape"}));
        expect(screen.queryByLabelText("Nombre d'impros")).toBeNull();
    });

    it('lets the user rename a step from the inline editor', () => {
        render(<SessionCreationScreen workflowId={null} onDone={() => {}}/>);
        fireEvent.click(screen.getByRole('button', {name: 'Image'}));
        fireEvent.click(screen.getByRole('button', {name: "Modifier l'étape"}));

        fireEvent.change(screen.getByLabelText('Nom'), {target: {value: 'Logo établissement'}});
        expect(screen.getByText('Logo établissement')).toBeTruthy();
    });
});

describe('SessionCreationScreen - editing an existing workflow', () => {
    beforeEach(() => {
        window.electronAPI = {
            workflowFetch: jest.fn(),
            stepFetch: jest.fn(),
            workflowSave: jest.fn(),
            stepSave: jest.fn(),
            stepRemove: jest.fn(),
        };
    });

    function seedWorkflows(workflows) {
        act(() => {
            document.dispatchEvent(new CustomEvent('workflow-onchange', {detail: workflows}));
        });
    }

    function seedSteps(steps) {
        act(() => {
            document.dispatchEvent(new CustomEvent('step-onchange', {detail: steps}));
        });
    }

    it('loads the workflow name and its steps for editing', () => {
        render(<SessionCreationScreen workflowId="wf-1" onDone={() => {}}/>);
        seedWorkflows([{id: 'wf-1', name: 'Remise des diplômes', color: '#378ADD', createdAt: '2026-01-01'}]);
        seedSteps([
            {id: 'step-1', type: 'image', name: 'Logo établissement', src: '/tmp/logo.png', createdAt: '2026-01-01'},
            {id: 'step-2', type: 'battle-royal', name: 'Quiz final', players: ['Alex', 'Sam'], createdAt: '2026-01-01'},
        ]);

        expect(screen.getByLabelText('Nom de la session').value).toBe('Remise des diplômes');
        expect(screen.getByText('Logo établissement')).toBeTruthy();
        expect(screen.getByText('Quiz final')).toBeTruthy();
    });

    it('joins a persisted array of players into a semicolon-separated string for editing', () => {
        render(<SessionCreationScreen workflowId="wf-1" onDone={() => {}}/>);
        seedWorkflows([{id: 'wf-1', name: 'Remise des diplômes', color: '#378ADD', createdAt: '2026-01-01'}]);
        seedSteps([{id: 'step-2', type: 'battle-royal', name: 'Quiz final', players: ['Alex', 'Sam'], createdAt: '2026-01-01'}]);

        fireEvent.click(screen.getByRole('button', {name: "Modifier l'étape"}));
        expect(screen.getByLabelText('Joueurs').value).toBe('Alex; Sam');
    });
});
