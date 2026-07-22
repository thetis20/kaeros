import '../../../lib/i18n';
import {render, screen, fireEvent} from '@testing-library/react';
import Sidebar from '../Sidebar';

describe('Sidebar', () => {
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

    it('renders without throwing and highlights nothing for an unrecognized screen value', () => {
        render(<Sidebar screen="creation" onNavigate={() => {}} sessionRunning={false} musicPlaying={false}/>);
        expect(screen.getByRole('button', {name: /Régie/})).not.toHaveClass('active');
        expect(screen.getByRole('button', {name: /Musique/})).not.toHaveClass('active');
        expect(screen.getByRole('button', {name: /Sessions/})).not.toHaveClass('active');
    });
});
