import '../../../lib/i18n';
import {act, render, screen, fireEvent, within} from '@testing-library/react';
import Dashboard from '../Dashboard';

describe('Dashboard audio integration (unmocked)', () => {
    beforeEach(() => {
        window.electronAPI = {
            workflowFetch: jest.fn(),
            trackFetch: jest.fn(),
            trackPlay: jest.fn(),
            trackEnd: jest.fn(),
        };
        delete window.session;
    });

    function seedTracks(tracks) {
        act(() => {
            document.dispatchEvent(new CustomEvent('track-onchange', {detail: tracks}));
        });
    }

    it('starts a track from RegieScreen\'s "Démarrer une musique" card, reflects it in "Audio en cours", and keeps it playing after navigating to another screen', () => {
        render(<Dashboard/>);
        seedTracks([{id: 't1', name: 'Générique', src: '/tmp/t1.mp3', tag: 'Musique', color: '#4C6EFF'}]);

        expect(screen.queryByRole('button', {name: /stop/i})).toBeNull();

        fireEvent.click(screen.getByRole('button', {name: 'Démarrer'}));

        expect(window.electronAPI.trackPlay).toHaveBeenCalledWith('t1');
        expect(screen.getByRole('button', {name: 'En cours'})).toBeDisabled();
        expect(screen.getByRole('button', {name: /stop/i})).toBeTruthy();

        const nav = screen.getByRole('navigation');
        fireEvent.click(within(nav).getByRole('button', {name: /Musique/}));

        expect(screen.getByRole('button', {name: /stop/i})).toBeTruthy();
    });
});
