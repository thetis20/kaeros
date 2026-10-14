import '../../../lib/i18n';
import {render, screen, fireEvent} from '@testing-library/react';
import Dashboard from '../Dashboard';

const mockGuard = {dirty: false, saveResult: true, save: jest.fn()};

jest.mock('../../Screen/RegieScreen', () => function FakeRegieScreen() { return <div>regie-stub</div>; });
jest.mock('../WorkflowDashboard', () => function FakeWorkflowDashboard() { return <div>sessions-stub</div>; });
jest.mock('../../Screen/SessionCreationScreen', () => function FakeSessionCreationScreen() { return <div>creation-stub</div>; });
jest.mock('../../Screen/MusiqueScreen', () => function FakeMusiqueScreen({guardRef}) {
    guardRef.current = {isDirty: () => mockGuard.dirty, save: mockGuard.save};
    return <div>musique-stub</div>;
});

describe('Dashboard - unsaved changes guard', () => {
    beforeEach(() => {
        window.electronAPI = {workflowFetch: jest.fn(), trackPlay: jest.fn(), trackEnd: jest.fn()};
        delete window.session;
        mockGuard.dirty = false;
        mockGuard.save = jest.fn(() => true);
    });

    function openMusiqueThenClickRegie() {
        render(<Dashboard/>);
        fireEvent.click(screen.getByRole('button', {name: /Musique/}));
        fireEvent.click(screen.getByRole('button', {name: /Régie/}));
    }

    it('navigates directly when the screen is not dirty', () => {
        openMusiqueThenClickRegie();

        expect(screen.getByText('regie-stub')).toBeTruthy();
        expect(screen.queryByRole('dialog')).toBeNull();
    });

    it('opens the dialog instead of navigating when the screen is dirty', () => {
        mockGuard.dirty = true;
        openMusiqueThenClickRegie();

        expect(screen.getByRole('dialog')).toBeTruthy();
        expect(screen.getByText('musique-stub')).toBeTruthy();
    });

    it('saves then navigates when save succeeds', () => {
        mockGuard.dirty = true;
        openMusiqueThenClickRegie();
        fireEvent.click(screen.getByRole('button', {name: 'Continuer en enregistrant'}));

        expect(mockGuard.save).toHaveBeenCalledTimes(1);
        expect(screen.getByText('regie-stub')).toBeTruthy();
        expect(screen.queryByRole('dialog')).toBeNull();
    });

    it('stays on the screen and closes the dialog when save is invalid', () => {
        mockGuard.dirty = true;
        mockGuard.save = jest.fn(() => false);
        openMusiqueThenClickRegie();
        fireEvent.click(screen.getByRole('button', {name: 'Continuer en enregistrant'}));

        expect(mockGuard.save).toHaveBeenCalledTimes(1);
        expect(screen.getByText('musique-stub')).toBeTruthy();
        expect(screen.queryByRole('dialog')).toBeNull();
    });

    it('navigates without saving on "Continuer sans enregistrer"', () => {
        mockGuard.dirty = true;
        openMusiqueThenClickRegie();
        fireEvent.click(screen.getByRole('button', {name: 'Continuer sans enregistrer'}));

        expect(mockGuard.save).not.toHaveBeenCalled();
        expect(screen.getByText('regie-stub')).toBeTruthy();
        expect(screen.queryByRole('dialog')).toBeNull();
    });

    it('stays on the screen on Annuler', () => {
        mockGuard.dirty = true;
        openMusiqueThenClickRegie();
        fireEvent.click(screen.getByRole('button', {name: 'Annuler'}));

        expect(mockGuard.save).not.toHaveBeenCalled();
        expect(screen.getByText('musique-stub')).toBeTruthy();
        expect(screen.queryByRole('dialog')).toBeNull();
    });
});
