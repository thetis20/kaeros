import '../../../lib/i18n';
import {render, screen, fireEvent, act} from '@testing-library/react';
import Dashboard from '../Dashboard';

jest.mock('../../Screen/RegieScreen', () => function FakeRegieScreen() { return <div>regie-stub</div>; });
jest.mock('../../Screen/MusiqueScreen', () => function FakeMusiqueScreen() { return <div>musique-stub</div>; });
jest.mock('../WorkflowDashboard', () => function FakeWorkflowDashboard({onCreateNew, onEditWorkflow}) {
    return (
        <div>
            sessions-stub
            <button onClick={onCreateNew}>fake-create</button>
            <button onClick={() => onEditWorkflow({id: 'wf-9'})}>fake-edit</button>
        </div>
    );
});
jest.mock('../../Screen/SessionCreationScreen', () => function FakeSessionCreationScreen({workflowId, onDone}) {
    return (
        <div>
            creation-stub:{String(workflowId)}
            <button onClick={onDone}>fake-done</button>
        </div>
    );
});

describe('Dashboard', () => {
    beforeEach(() => {
        window.electronAPI = {workflowFetch: jest.fn(), trackPlay: jest.fn(), trackEnd: jest.fn()};
        delete window.session;
    });

    it('shows the Régie screen by default', () => {
        render(<Dashboard/>);
        expect(screen.getByText('regie-stub')).toBeTruthy();
    });

    it('switches to the Musique screen when its nav item is clicked', () => {
        render(<Dashboard/>);
        fireEvent.click(screen.getByRole('button', {name: /Musique/}));

        expect(screen.getByText('musique-stub')).toBeTruthy();
        expect(screen.queryByText('regie-stub')).toBeNull();
    });

    it('switches to the Sessions screen when its nav item is clicked', () => {
        render(<Dashboard/>);
        fireEvent.click(screen.getByRole('button', {name: /Sessions/}));

        expect(screen.getByText('sessions-stub')).toBeTruthy();
        expect(screen.queryByText('regie-stub')).toBeNull();
    });

    it('switches back to Régie from another screen', () => {
        render(<Dashboard/>);
        fireEvent.click(screen.getByRole('button', {name: /Musique/}));
        fireEvent.click(screen.getByRole('button', {name: /Régie/}));

        expect(screen.getByText('regie-stub')).toBeTruthy();
    });

    it('shows the "Audio en cours" card and reacts to audio-play regardless of active screen', () => {
        render(<Dashboard/>);
        expect(screen.getByText('Audio en cours')).toBeTruthy();

        act(() => {
            document.dispatchEvent(new CustomEvent('audio-play', {detail: {id: 'a1', name: 'Track One', src: '/tmp/track1.mp3'}}));
        });

        expect(screen.getByText('Track One')).toBeTruthy();
        expect(window.electronAPI.trackPlay).toHaveBeenCalledWith('a1');
    });

    it('keeps the playing audio mounted after navigating away from Régie', () => {
        render(<Dashboard/>);
        act(() => {
            document.dispatchEvent(new CustomEvent('audio-play', {detail: {id: 'a1', name: 'Track One', src: '/tmp/track1.mp3'}}));
        });

        fireEvent.click(screen.getByRole('button', {name: /Musique/}));

        expect(screen.getByText('musique-stub')).toBeTruthy();
        expect(screen.getByText('Track One')).toBeTruthy();
    });

    it('hides the "Audio en cours" card chrome when nothing is playing, without unmounting AudioController', () => {
        render(<Dashboard/>);

        expect(screen.getByText('Audio en cours').closest('.card')).toHaveStyle({display: 'none'});

        act(() => {
            document.dispatchEvent(new CustomEvent('audio-play', {detail: {id: 'a1', name: 'Track One', src: '/tmp/track1.mp3'}}));
        });

        expect(screen.getByText('Audio en cours').closest('.card')).not.toHaveStyle({display: 'none'});
    });

    it('navigates to the creation screen with no workflow id when WorkflowDashboard asks to create a new session', () => {
        render(<Dashboard/>);
        fireEvent.click(screen.getByRole('button', {name: /Sessions/}));
        fireEvent.click(screen.getByText('fake-create'));

        expect(screen.getByText('creation-stub:null')).toBeTruthy();
    });

    it('navigates to the creation screen with the workflow id when WorkflowDashboard asks to edit', () => {
        render(<Dashboard/>);
        fireEvent.click(screen.getByRole('button', {name: /Sessions/}));
        fireEvent.click(screen.getByText('fake-edit'));

        expect(screen.getByText('creation-stub:wf-9')).toBeTruthy();
    });

    it('returns to the Sessions screen when the creation screen calls onDone', () => {
        render(<Dashboard/>);
        fireEvent.click(screen.getByRole('button', {name: /Sessions/}));
        fireEvent.click(screen.getByText('fake-create'));
        fireEvent.click(screen.getByText('fake-done'));

        expect(screen.getByText('sessions-stub')).toBeTruthy();
        expect(screen.queryByText(/creation-stub/)).toBeNull();
    });
});
