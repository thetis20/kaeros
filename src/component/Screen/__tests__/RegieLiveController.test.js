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
