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

describe('SessionCreationScreen - saving', () => {
    beforeEach(() => {
        window.electronAPI = {
            workflowFetch: jest.fn(),
            stepFetch: jest.fn(),
            workflowSave: jest.fn(),
            stepSave: jest.fn(),
            stepRemove: jest.fn(),
        };
    });

    it('blocks save and shows a validation error when a step is invalid', () => {
        render(<SessionCreationScreen workflowId={null} onDone={jest.fn()}/>);
        fireEvent.change(screen.getByLabelText('Nom de la session'), {target: {value: 'Remise des diplômes'}});
        fireEvent.click(screen.getByRole('button', {name: 'Image'}));

        fireEvent.click(screen.getByRole('button', {name: 'Enregistrer'}));
        expect(window.electronAPI.workflowSave).not.toHaveBeenCalled();

        // the invalid step auto-opens on a blocked save, so its error is visible without an extra click
        expect(screen.getByText('Un fichier est obligatoire.')).toBeTruthy();
    });

    it('blocks save and shows a validation error when the session name is empty', () => {
        render(<SessionCreationScreen workflowId={null} onDone={jest.fn()}/>);
        fireEvent.click(screen.getByRole('button', {name: 'Time'}));

        fireEvent.click(screen.getByRole('button', {name: 'Enregistrer'}));

        expect(window.electronAPI.workflowSave).not.toHaveBeenCalled();
        expect(window.electronAPI.stepRemove).not.toHaveBeenCalled();
        expect(window.electronAPI.stepSave).not.toHaveBeenCalled();
        expect(screen.getByText('Le nom est obligatoire.')).toBeTruthy();
    });

    it('auto-opens a closed invalid step and shows its error when save is blocked', () => {
        render(<SessionCreationScreen workflowId={null} onDone={jest.fn()}/>);
        fireEvent.change(screen.getByLabelText('Nom de la session'), {target: {value: 'Remise des diplômes'}});
        fireEvent.click(screen.getByRole('button', {name: 'Image'}));

        expect(screen.queryByText('Un fichier est obligatoire.')).toBeNull();

        fireEvent.click(screen.getByRole('button', {name: 'Enregistrer'}));

        expect(window.electronAPI.workflowSave).not.toHaveBeenCalled();
        expect(screen.getByText('Un fichier est obligatoire.')).toBeTruthy();
    });

    it('saves a brand-new session: creates the workflow (no createdAt) then each step in order, and calls onDone', () => {
        const onDone = jest.fn();
        render(<SessionCreationScreen workflowId={null} onDone={onDone}/>);
        fireEvent.change(screen.getByLabelText('Nom de la session'), {target: {value: 'Remise des diplômes'}});
        fireEvent.click(screen.getByRole('button', {name: 'Time'}));

        fireEvent.click(screen.getByRole('button', {name: 'Enregistrer'}));

        expect(window.electronAPI.workflowSave).toHaveBeenCalledWith(expect.objectContaining({name: 'Remise des diplômes'}));
        expect(window.electronAPI.workflowSave.mock.calls[0][0].createdAt).toBeUndefined();
        expect(window.electronAPI.stepRemove).not.toHaveBeenCalled();

        const savedWorkflowId = window.electronAPI.workflowSave.mock.calls[0][0].id;
        expect(window.electronAPI.stepSave).toHaveBeenCalledWith(expect.objectContaining({
            workflowId: savedWorkflowId,
            value: expect.objectContaining({type: 'time', name: 'Nouveau time', impro: '1', minutes: '2'}),
            afterIndex: undefined,
        }));
        expect(window.electronAPI.stepSave.mock.calls[0][0].value.createdAt).toBeUndefined();
        expect(onDone).toHaveBeenCalledTimes(1);
    });

    it('re-saving an edited session deletes all previously-persisted steps then recreates the final list in order', () => {
        const onDone = jest.fn();
        render(<SessionCreationScreen workflowId="wf-1" onDone={onDone}/>);
        act(() => {
            document.dispatchEvent(new CustomEvent('workflow-onchange', {detail: [{id: 'wf-1', name: 'Remise des diplômes', color: '#378ADD', createdAt: '2026-01-01'}]}));
        });
        act(() => {
            document.dispatchEvent(new CustomEvent('step-onchange', {detail: [
                {id: 'step-1', type: 'time', name: 'Impros', impro: '3', minutes: '2', createdAt: '2026-01-01'},
            ]}));
        });

        fireEvent.click(screen.getByRole('button', {name: 'Image'}));
        fireEvent.click(screen.getAllByRole('button', {name: 'Monter'})[1]);

        // two steps now exist (Image reordered to the front, then the persisted Time step) —
        // open the first row's editor (Image) by index, since both rows share the same aria-label
        fireEvent.click(screen.getAllByRole('button', {name: "Modifier l'étape"})[0]);
        const file = new File(['img'], 'logo.png', {type: 'image/png'});
        fireEvent.change(screen.getByLabelText('Image'), {target: {files: [file]}});

        fireEvent.click(screen.getByRole('button', {name: 'Enregistrer'}));

        expect(window.electronAPI.workflowSave).toHaveBeenCalledWith(expect.objectContaining({
            id: 'wf-1', name: 'Remise des diplômes', color: '#378ADD', createdAt: '2026-01-01',
        }));
        expect(window.electronAPI.stepRemove).toHaveBeenCalledWith('wf-1', 'step-1');
        expect(window.electronAPI.stepSave).toHaveBeenNthCalledWith(1, expect.objectContaining({
            workflowId: 'wf-1',
            value: expect.objectContaining({type: 'image', file}),
            afterIndex: undefined,
        }));
        expect(window.electronAPI.stepSave).toHaveBeenNthCalledWith(2, expect.objectContaining({
            workflowId: 'wf-1',
            value: expect.objectContaining({type: 'time', name: 'Impros'}),
            afterIndex: 0,
        }));
        expect(window.electronAPI.stepSave.mock.calls[1][0].value.createdAt).toBeUndefined();
        expect(onDone).toHaveBeenCalledTimes(1);
    });
});
