import '../../../lib/i18n';
import {render, screen, fireEvent, waitFor} from '@testing-library/react';
import Sidebar from '../Sidebar';

describe('Sidebar', () => {
    beforeEach(() => {
        window.electronAPI = {appUninstall: jest.fn().mockResolvedValue({ok: true, mode: 'mac-trash'})};
    });

    it('highlights the active screen and calls onNavigate when clicking another item', () => {
        const onNavigate = jest.fn();
        render(<Sidebar screen="regie" onNavigate={onNavigate} sessionRunning={false} musicPlaying={false}/>);

        expect(screen.getByRole('button', {name: /Régie/})).toHaveClass('active');
        expect(screen.getByRole('button', {name: /Musique/})).not.toHaveClass('active');

        fireEvent.click(screen.getByRole('button', {name: /Musique/}));
        expect(onNavigate).toHaveBeenCalledWith('musique');

        fireEvent.click(screen.getByRole('button', {name: /Sessions/}));
        expect(onNavigate).toHaveBeenCalledWith('sessions');
    });

    it('shows the session pastille only when a session is running', () => {
        const {rerender} = render(<Sidebar screen="regie" onNavigate={() => {}} sessionRunning={false} musicPlaying={false}/>);
        expect(screen.queryByTitle('Session en cours')).toBeNull();

        rerender(<Sidebar screen="regie" onNavigate={() => {}} sessionRunning={true} musicPlaying={false}/>);
        expect(screen.getByTitle('Session en cours')).toBeTruthy();
    });

    it('shows the music pastille only when music is playing', () => {
        const {rerender} = render(<Sidebar screen="regie" onNavigate={() => {}} sessionRunning={false} musicPlaying={false}/>);
        expect(screen.queryByTitle('Musique en cours')).toBeNull();

        rerender(<Sidebar screen="regie" onNavigate={() => {}} sessionRunning={false} musicPlaying={true}/>);
        expect(screen.getByTitle('Musique en cours')).toBeTruthy();
    });

    it('renders without throwing and highlights nothing for a genuinely unrecognized screen value', () => {
        render(<Sidebar screen="unknown" onNavigate={() => {}} sessionRunning={false} musicPlaying={false}/>);
        expect(screen.getByRole('button', {name: /Régie/})).not.toHaveClass('active');
        expect(screen.getByRole('button', {name: /Musique/})).not.toHaveClass('active');
        expect(screen.getByRole('button', {name: /Sessions/})).not.toHaveClass('active');
    });

    it('treats "creation" as a Sessions sub-view for active-state highlighting', () => {
        render(<Sidebar screen="creation" onNavigate={() => {}} sessionRunning={false} musicPlaying={false}/>);
        expect(screen.getByRole('button', {name: /Sessions/})).toHaveClass('active');
        expect(screen.getByRole('button', {name: /Régie/})).not.toHaveClass('active');
        expect(screen.getByRole('button', {name: /Musique/})).not.toHaveClass('active');
    });

    describe('uninstall', () => {
        function renderSidebar() {
            render(<Sidebar screen="regie" onNavigate={() => {}} sessionRunning={false} musicPlaying={false}/>);
        }

        it('renders the uninstall button without calling the API', () => {
            renderSidebar();
            expect(screen.getByRole('button', {name: 'Désinstaller…'})).toBeTruthy();
            expect(window.electronAPI.appUninstall).not.toHaveBeenCalled();
        });

        it('calls appUninstall directly on click, without an in-app dialog', async () => {
            renderSidebar();
            fireEvent.click(screen.getByRole('button', {name: 'Désinstaller…'}));

            expect(screen.queryByRole('dialog')).toBeNull();
            await waitFor(() => expect(window.electronAPI.appUninstall).toHaveBeenCalledTimes(1));
        });

        it('shows the error when the uninstall fails', async () => {
            window.electronAPI.appUninstall.mockResolvedValue({ok: false, error: 'boom'});
            renderSidebar();
            fireEvent.click(screen.getByRole('button', {name: 'Désinstaller…'}));

            expect(await screen.findByText(/La désinstallation a échoué.*boom/)).toBeTruthy();
        });

        it('shows nothing when the native confirm is canceled', async () => {
            window.electronAPI.appUninstall.mockResolvedValue({ok: false, canceled: true});
            renderSidebar();
            fireEvent.click(screen.getByRole('button', {name: 'Désinstaller…'}));

            await waitFor(() => expect(window.electronAPI.appUninstall).toHaveBeenCalled());
            expect(screen.queryByRole('alert')).toBeNull();
        });

        it('shows the Linux info message in data-only mode', async () => {
            window.electronAPI.appUninstall.mockResolvedValue({ok: true, mode: 'data-only'});
            renderSidebar();
            fireEvent.click(screen.getByRole('button', {name: 'Désinstaller…'}));

            expect(await screen.findByText(/sudo apt remove kaeros/)).toBeTruthy();
        });
    });
});
