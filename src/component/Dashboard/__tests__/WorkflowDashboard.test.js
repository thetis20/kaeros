import '../../../lib/i18n';
import {act, render, screen, fireEvent} from '@testing-library/react';
import WorkflowDashboard from '../WorkflowDashboard';

describe('WorkflowDashboard', () => {
    beforeEach(() => {
        window.electronAPI = {
            workflowFetch: jest.fn(),
            workflowRemove: jest.fn(),
            sessionPlay: jest.fn(),
        };
    });

    function seedWorkflows(workflows) {
        act(() => {
            document.dispatchEvent(new CustomEvent('workflow-onchange', {detail: workflows}));
        });
    }

    it('calls onCreateNew when the create button is clicked', () => {
        const onCreateNew = jest.fn();
        render(<WorkflowDashboard onCreateNew={onCreateNew} onEditWorkflow={() => {}}/>);
        fireEvent.click(screen.getByRole('button', {name: /Créer une session/}));

        expect(onCreateNew).toHaveBeenCalledTimes(1);
    });

    it('renders one card per workflow with name and relative update time', () => {
        render(<WorkflowDashboard onCreateNew={() => {}} onEditWorkflow={() => {}}/>);
        const workflow = {id: 'wf-1', name: 'Remise des diplômes', color: '#378ADD', updatedAt: new Date().toISOString()};
        seedWorkflows([workflow]);

        expect(screen.getByText('Remise des diplômes')).toBeInTheDocument();
    });

    it('calls onEditWorkflow with the workflow when its Modifier button is clicked', () => {
        const onEditWorkflow = jest.fn();
        render(<WorkflowDashboard onEditWorkflow={onEditWorkflow} onCreateNew={() => {}}/>);
        const workflow = {id: 'wf-1', name: 'Remise des diplômes', color: '#378ADD'};
        seedWorkflows([workflow]);

        fireEvent.click(screen.getByRole('button', {name: /Modifier/}));

        expect(onEditWorkflow).toHaveBeenCalledWith(workflow);
    });

    it('removes the workflow via IPC when its Supprimer button is clicked', () => {
        render(<WorkflowDashboard onCreateNew={() => {}} onEditWorkflow={() => {}}/>);
        const workflow = {id: 'wf-1', name: 'Gala annuel', color: '#D85A30'};
        seedWorkflows([workflow]);

        fireEvent.click(screen.getByRole('button', {name: /Supprimer/}));

        expect(window.electronAPI.workflowRemove).toHaveBeenCalledWith('wf-1');
    });

    it('plays the workflow via IPC when its Démarrer button is clicked', () => {
        render(<WorkflowDashboard onCreateNew={() => {}} onEditWorkflow={() => {}}/>);
        const workflow = {id: 'wf-1', name: 'Soirée', color: '#1D9E75'};
        seedWorkflows([workflow]);

        fireEvent.click(screen.getByRole('button', {name: /Démarrer/}));

        expect(window.electronAPI.sessionPlay).toHaveBeenCalledWith(workflow);
    });
});
