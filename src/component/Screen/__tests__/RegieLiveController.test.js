import '../../../lib/i18n';
import {render, screen, fireEvent} from '@testing-library/react';
import RegieLiveController from '../RegieLiveController';

describe('RegieLiveController', () => {
    afterEach(() => {
        delete window.session;
    });

    it('renders nothing when there is no active session', () => {
        const {container} = render(<RegieLiveController/>);
        expect(container).toBeEmptyDOMElement();
    });

    it('defaults the active tab to the current track type and shows the decorative image panel', () => {
        window.session = {track: {type: 'image', src: '/tmp/logo.png'}, steps: [{id: 's1', name: 'Logo', type: 'image'}], index: 0};
        render(<RegieLiveController/>);

        expect(screen.getByRole('button', {name: 'Image'})).toHaveClass('btn-primary');
        expect(screen.getByText('Aperçu image plein écran')).toBeTruthy();
    });

    it('renders all four tabs', () => {
        window.session = {track: {type: 'time', count: 1, impro: 3}, steps: [], index: 0};
        render(<RegieLiveController/>);

        expect(screen.getByRole('button', {name: 'Image'})).toBeTruthy();
        expect(screen.getByRole('button', {name: 'Vidéo de doublage'})).toBeTruthy();
        expect(screen.getByRole('button', {name: 'Time'})).toBeTruthy();
        expect(screen.getByRole('button', {name: 'Battle Royal'})).toBeTruthy();
    });

    it('switches to the decorative, non-interactive dubbing-video panel when its tab is clicked', () => {
        window.session = {track: {type: 'image', src: '/tmp/logo.png'}, steps: [{id: 's1', name: 'Logo', type: 'image'}], index: 0};
        render(<RegieLiveController/>);

        fireEvent.click(screen.getByRole('button', {name: 'Vidéo de doublage'}));

        expect(screen.getByText('Lecture vidéo (muet)')).toBeTruthy();
        expect(screen.getByRole('slider')).toBeDisabled();
    });
});

describe('RegieLiveController - time tab', () => {
    beforeEach(() => {
        window.electronAPI = {trackChange: jest.fn()};
    });
    afterEach(() => {
        delete window.session;
    });

    it('shows the current impro count and a MM:SS countdown derived from the real TimeTrack', () => {
        window.session = {
            track: {type: 'time', impro: 3, minutes: 2, count: 2, time: 95, paused: false, status: 'STATUS_RUNNING'},
            steps: [{id: 's1', name: 'Impros', type: 'time'}],
            index: 0,
        };
        render(<RegieLiveController/>);

        expect(screen.getByText('Impro 2 / 3')).toBeTruthy();
        expect(screen.getByText('01:35')).toBeTruthy();
    });

    it('calls session.plus()/session.minus() (real trackChange IPC) from the impro navigation buttons', () => {
        window.session = {
            track: {type: 'time', impro: 3, minutes: 2, count: 2, time: 95, paused: false, status: 'STATUS_RUNNING'},
            steps: [{id: 's1', name: 'Impros', type: 'time'}],
            index: 0,
        };
        render(<RegieLiveController/>);

        fireEvent.click(screen.getByRole('button', {name: 'Impro suivante'}));
        expect(window.electronAPI.trackChange).toHaveBeenCalledWith({count: 3});

        fireEvent.click(screen.getByRole('button', {name: 'Impro précédente'}));
        expect(window.electronAPI.trackChange).toHaveBeenCalledWith({count: 1});
    });

    it('disables navigation at the impro boundaries', () => {
        window.session = {
            track: {type: 'time', impro: 3, minutes: 2, count: 3, time: 10, paused: false, status: 'STATUS_RUNNING'},
            steps: [{id: 's1', name: 'Impros', type: 'time'}],
            index: 0,
        };
        render(<RegieLiveController/>);

        expect(screen.getByRole('button', {name: 'Impro suivante'})).toBeDisabled();
        expect(screen.getByRole('button', {name: 'Impro précédente'})).not.toBeDisabled();
    });

    it('shows the inactive fallback on the time tab when the current step is not a time step', () => {
        window.session = {
            track: {type: 'image', src: '/tmp/logo.png'},
            steps: [{id: 's1', name: 'Logo', type: 'image'}, {id: 's2', name: 'Impros', type: 'time'}],
            index: 0,
        };
        render(<RegieLiveController/>);

        fireEvent.click(screen.getByRole('button', {name: 'Time'}));

        expect(screen.getByText("Cette étape n'est pas l'étape en cours.")).toBeTruthy();
    });
});

describe('RegieLiveController - battle-royal tab', () => {
    beforeEach(() => {
        window.electronAPI = {trackChange: jest.fn()};
    });
    afterEach(() => {
        delete window.session;
    });

    it('reuses BattleRoyalStepController for the live scoreboard when the current step is battle-royal', () => {
        window.session = {
            track: {
                type: 'battle-royal',
                players: [
                    {id: 'p1', name: 'Alice', score: 2, enabled: true},
                    {id: 'p2', name: 'Bob', score: 0, enabled: true},
                ],
            },
            steps: [{id: 's1', name: 'Quiz final', type: 'battle-royal'}],
            index: 0,
        };
        render(<RegieLiveController/>);

        expect(screen.getByText(/Alice/)).toBeTruthy();
        expect(screen.getByText(/Bob/)).toBeTruthy();

        const incrementAlice = document.querySelector('#regie-controller .btn-primary');
        fireEvent.click(incrementAlice);

        expect(window.electronAPI.trackChange).toHaveBeenCalledWith({
            players: [
                {id: 'p1', name: 'Alice', score: 3, enabled: true},
                {id: 'p2', name: 'Bob', score: 0, enabled: true},
            ],
        });
    });

    it('shows the inactive fallback on the battle-royal tab when the current step is not battle-royal', () => {
        window.session = {
            track: {type: 'image', src: '/tmp/logo.png'},
            steps: [{id: 's1', name: 'Logo', type: 'image'}, {id: 's2', name: 'Quiz final', type: 'battle-royal'}],
            index: 0,
        };
        render(<RegieLiveController/>);

        fireEvent.click(screen.getByRole('button', {name: 'Battle Royal'}));

        expect(screen.getByText("Cette étape n'est pas l'étape en cours.")).toBeTruthy();
    });
});
