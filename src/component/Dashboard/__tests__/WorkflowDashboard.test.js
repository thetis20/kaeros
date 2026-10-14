import '../../../lib/i18n';
import {act, render, screen, fireEvent, waitFor} from '@testing-library/react';
import WorkflowDashboard from '../WorkflowDashboard';

describe('WorkflowDashboard', () => {
    beforeEach(() => {
        window.electronAPI = {
            workflowFetch: jest.fn(),
            workflowRemove: jest.fn(),
            sessionPlay: jest.fn(),
            workflowExport: jest.fn(),
            workflowImport: jest.fn(),
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

    it('calls onPlay with the workflow when its Démarrer button is clicked', () => {
        const onPlay = jest.fn();
        render(<WorkflowDashboard onCreateNew={() => {}} onEditWorkflow={() => {}} onPlay={onPlay} checking={false}/>);
        const workflow = {id: 'wf-1', name: 'Soirée', color: '#1D9E75'};
        seedWorkflows([workflow]);

        fireEvent.click(screen.getByRole('button', {name: 'Démarrer'}));

        expect(onPlay).toHaveBeenCalledWith(workflow);
        expect(window.electronAPI.sessionPlay).not.toHaveBeenCalled();
    });

    it('disables the play button and shows the checking label while media is being checked', () => {
        render(<WorkflowDashboard onCreateNew={() => {}} onEditWorkflow={() => {}} onPlay={() => {}} checking={true}/>);
        const workflow = {id: 'wf-1', name: 'Soirée', color: '#1D9E75'};
        seedWorkflows([workflow]);

        expect(screen.getByRole('button', {name: 'Vérification des médias…'})).toBeDisabled();
    });

    describe('export / import', () => {
        const workflow = {id: 'wf-1', name: 'Soirée', color: '#1D9E75'};

        function setup() {
            render(<WorkflowDashboard onCreateNew={() => {}} onEditWorkflow={() => {}}/>);
            seedWorkflows([workflow]);
        }

        it('calls workflowExport with the id and shows the success path', async () => {
            window.electronAPI.workflowExport.mockResolvedValue({ok: true, path: '/tmp/soiree.zip'});
            setup();
            fireEvent.click(screen.getByRole('button', {name: 'Exporter'}));

            expect(window.electronAPI.workflowExport).toHaveBeenCalledWith('wf-1');
            expect(await screen.findByText(/\/tmp\/soiree\.zip/)).toBeInTheDocument();
        });

        it('shows nothing when the export is canceled', async () => {
            window.electronAPI.workflowExport.mockResolvedValue({ok: false, canceled: true});
            setup();
            fireEvent.click(screen.getByRole('button', {name: 'Exporter'}));

            await waitFor(() => expect(screen.getByRole('button', {name: 'Exporter'})).not.toBeDisabled());
            expect(screen.queryByRole('alert')).not.toBeInTheDocument();
            expect(screen.queryByRole('dialog')).not.toBeInTheDocument();
            expect(screen.queryByText(/exportée/)).not.toBeInTheDocument();
        });

        it('shows the media error dialog when export returns issues', async () => {
            window.electronAPI.workflowExport.mockResolvedValue({
                ok: false,
                issues: [{id: 'e1', kind: 'step', name: 'Etape 1', src: '/a.mp4', code: 'missing'}],
            });
            setup();
            fireEvent.click(screen.getByRole('button', {name: 'Exporter'}));

            expect(await screen.findByRole('dialog')).toBeInTheDocument();
            expect(screen.getByText(/Etape 1/)).toBeInTheDocument();
        });

        it('shows a generic error when export fails or rejects', async () => {
            window.electronAPI.workflowExport.mockRejectedValue(new Error('boom'));
            setup();
            fireEvent.click(screen.getByRole('button', {name: 'Exporter'}));

            expect(await screen.findByRole('alert')).toHaveTextContent("L'export de la session a échoué.");
        });

        it('shows the import success message', async () => {
            window.electronAPI.workflowImport.mockResolvedValue({ok: true, workflowId: 'new'});
            setup();
            fireEvent.click(screen.getByRole('button', {name: 'Importer'}));

            expect(await screen.findByText('Session importée.')).toBeInTheDocument();
        });

        it('shows nothing when the import is canceled', async () => {
            window.electronAPI.workflowImport.mockResolvedValue({ok: false, canceled: true});
            setup();
            fireEvent.click(screen.getByRole('button', {name: 'Importer'}));

            await waitFor(() => expect(screen.getByRole('button', {name: 'Importer'})).not.toBeDisabled());
            expect(screen.queryByRole('alert')).not.toBeInTheDocument();
            expect(screen.queryByText('Session importée.')).not.toBeInTheDocument();
        });

        it.each([
            ['invalid', /pas une archive de session valide/],
            ['version', /version incompatible/],
            ['step', /étape de l'archive est invalide/],
            ['other', /L'import de la session a échoué/],
        ])('shows the import error for %s', async (error, expected) => {
            window.electronAPI.workflowImport.mockResolvedValue({ok: false, error});
            setup();
            fireEvent.click(screen.getByRole('button', {name: 'Importer'}));

            expect(await screen.findByRole('alert')).toHaveTextContent(expected);
        });

        it('shows a generic error when import rejects', async () => {
            window.electronAPI.workflowImport.mockRejectedValue(new Error('boom'));
            setup();
            fireEvent.click(screen.getByRole('button', {name: 'Importer'}));

            expect(await screen.findByRole('alert')).toHaveTextContent("L'import de la session a échoué.");
        });

        it('disables export and import buttons while an operation is running', async () => {
            let resolve;
            window.electronAPI.workflowExport.mockReturnValue(new Promise((r) => { resolve = r; }));
            setup();
            fireEvent.click(screen.getByRole('button', {name: 'Exporter'}));

            expect(screen.getByRole('button', {name: 'Exporter'})).toBeDisabled();
            expect(screen.getByRole('button', {name: 'Importer'})).toBeDisabled();

            await act(async () => { resolve({ok: false, canceled: true}); });
            expect(screen.getByRole('button', {name: 'Exporter'})).not.toBeDisabled();
            expect(screen.getByRole('button', {name: 'Importer'})).not.toBeDisabled();
        });
    });
});
