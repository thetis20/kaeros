import '../../../lib/i18n';
import {act, render, screen, fireEvent} from '@testing-library/react';
import WorkflowDashboard from '../WorkflowDashboard';

describe('WorkflowDashboard', () => {
    beforeEach(() => {
        window.electronAPI = {
            workflowFetch: jest.fn(),
            workflowOpen: jest.fn(),
            workflowRemove: jest.fn(),
            sessionPlay: jest.fn(),
            stepFetch: jest.fn(),
        };
    });

    function seedWorkflows(workflows) {
        act(() => {
            document.dispatchEvent(new CustomEvent('workflow-onchange', {detail: workflows}));
        });
    }

    it('calls onCreateNew instead of opening the standalone Workflow window', () => {
        const onCreateNew = jest.fn();
        render(<WorkflowDashboard onCreateNew={onCreateNew} onEditWorkflow={() => {}}/>);
        fireEvent.click(screen.getByRole('button', {name: /Créer une session/}));

        expect(onCreateNew).toHaveBeenCalledTimes(1);
        expect(window.electronAPI.workflowOpen).not.toHaveBeenCalled();
    });

    it('calls onEditWorkflow with the selected workflow instead of opening the standalone Workflow window', () => {
        const onEditWorkflow = jest.fn();
        render(<WorkflowDashboard onEditWorkflow={onEditWorkflow} onCreateNew={() => {}}/>);
        const workflow = {id: 'wf-1', name: 'Remise des diplômes', color: '#378ADD'};
        seedWorkflows([workflow]);

        fireEvent.click(screen.getByText('Remise des diplômes'));
        fireEvent.click(screen.getByRole('button', {name: /Modifier/}));

        expect(onEditWorkflow).toHaveBeenCalledWith(workflow);
        expect(window.electronAPI.workflowOpen).not.toHaveBeenCalled();
    });

    it('still removes the selected workflow via the existing IPC call', () => {
        render(<WorkflowDashboard onCreateNew={() => {}} onEditWorkflow={() => {}}/>);
        const workflow = {id: 'wf-1', name: 'Gala annuel', color: '#D85A30'};
        seedWorkflows([workflow]);

        fireEvent.click(screen.getByText('Gala annuel'));
        fireEvent.click(screen.getByRole('button', {name: /Supprimer/}));

        expect(window.electronAPI.workflowRemove).toHaveBeenCalledWith('wf-1');
    });

    it('still plays the selected workflow via the existing IPC call', () => {
        render(<WorkflowDashboard onCreateNew={() => {}} onEditWorkflow={() => {}}/>);
        const workflow = {id: 'wf-1', name: 'Soirée', color: '#1D9E75'};
        seedWorkflows([workflow]);

        fireEvent.click(screen.getByText('Soirée'));
        fireEvent.click(screen.getByRole('button', {name: /Démarrer/}));

        expect(window.electronAPI.sessionPlay).toHaveBeenCalledWith(workflow);
    });
});
