import '../../../lib/i18n';
import {render, screen, fireEvent, act} from '@testing-library/react';
import RegieLiveController from '../RegieLiveController';

describe('RegieLiveController', () => {
    afterEach(() => {
        delete window.session;
    });

    it('renders nothing when there is no active session', () => {
        const {container} = render(<RegieLiveController/>);
        expect(container).toBeEmptyDOMElement();
    });

    it('shows the decorative image panel when the current step is an image', () => {
        window.session = {track: {type: 'image', src: '/tmp/logo.png'}, steps: [{id: 's1', name: 'Logo', type: 'image'}], index: 0};
        render(<RegieLiveController/>);

        expect(screen.getByText('Aperçu image plein écran')).toBeTruthy();
    });
});

describe('RegieLiveController - video tab', () => {
    beforeEach(() => {
        window.electronAPI = {trackChange: jest.fn()};
    });
    afterEach(() => {
        delete window.session;
    });

    it('shows the real playback progress (MM:SS elapsed/total, slider position) from the running video', () => {
        window.session = {
            track: {type: 'video', src: '/tmp/clip.mp4', currentTime: 30, duration: 120, paused: false, loop: false},
            steps: [{id: 's1', name: 'Sketch', type: 'video'}],
            index: 0,
        };
        render(<RegieLiveController/>);

        expect(screen.getByText('00:30')).toBeTruthy();
        expect(screen.getByText('02:00')).toBeTruthy();
        expect(screen.getByRole('slider')).toHaveValue('25');
        expect(screen.getByRole('slider')).toBeDisabled();
    });

    it('calls session.pause()/session.play() (real trackChange IPC) from the play/pause button', () => {
        window.session = {
            track: {type: 'video', src: '/tmp/clip.mp4', currentTime: 30, duration: 120, paused: false, loop: false},
            steps: [{id: 's1', name: 'Sketch', type: 'video'}],
            index: 0,
        };
        render(<RegieLiveController/>);

        fireEvent.click(screen.getByRole('button', {name: 'Pause'}));
        expect(window.electronAPI.trackChange).toHaveBeenCalledWith({paused: true});

        act(() => {
            document.dispatchEvent(new CustomEvent('session-onchange', {
                detail: {track: {type: 'video', src: '/tmp/clip.mp4', currentTime: 30, duration: 120, paused: true, loop: false}, steps: [{id: 's1', name: 'Sketch', type: 'video'}], index: 0},
            }));
        });

        fireEvent.click(screen.getByRole('button', {name: 'Play'}));
        expect(window.electronAPI.trackChange).toHaveBeenCalledWith({paused: false});
    });

    it('toggles loop live via the loop button (real trackChange IPC)', () => {
        window.session = {
            track: {type: 'video', src: '/tmp/clip.mp4', currentTime: 30, duration: 120, paused: false, loop: false},
            steps: [{id: 's1', name: 'Sketch', type: 'video'}],
            index: 0,
        };
        render(<RegieLiveController/>);

        fireEvent.click(screen.getByRole('button', {name: 'Activer la boucle'}));
        expect(window.electronAPI.trackChange).toHaveBeenCalledWith({loop: true});
    });
});

describe('RegieLiveController - dubbing-video tab', () => {
    beforeEach(() => {
        window.electronAPI = {trackChange: jest.fn()};
    });
    afterEach(() => {
        delete window.session;
    });

    it('shows the real playback progress (MM:SS elapsed/total, slider position) from the running video', () => {
        window.session = {
            track: {type: 'dubbing-video', src: '/tmp/video.mp4', currentTime: 30, duration: 120, paused: false, status: 'STATUS_RUNNING'},
            steps: [{id: 's1', name: 'Sketch', type: 'dubbing-video'}],
            index: 0,
        };
        render(<RegieLiveController/>);

        expect(screen.getByText('00:30')).toBeTruthy();
        expect(screen.getByText('02:00')).toBeTruthy();
        expect(screen.getByRole('slider')).toHaveValue('25');
        expect(screen.getByRole('slider')).toBeDisabled();
    });

    it('calls session.pause()/session.play() (real trackChange IPC) from the play/pause button', () => {
        window.session = {
            track: {type: 'dubbing-video', src: '/tmp/video.mp4', currentTime: 30, duration: 120, paused: false, status: 'STATUS_RUNNING'},
            steps: [{id: 's1', name: 'Sketch', type: 'dubbing-video'}],
            index: 0,
        };
        render(<RegieLiveController/>);

        fireEvent.click(screen.getByRole('button', {name: 'Pause'}));
        expect(window.electronAPI.trackChange).toHaveBeenCalledWith({paused: true});

        act(() => {
            document.dispatchEvent(new CustomEvent('session-onchange', {
                detail: {track: {type: 'dubbing-video', src: '/tmp/video.mp4', currentTime: 30, duration: 120, paused: true, status: 'STATUS_RUNNING'}, steps: [{id: 's1', name: 'Sketch', type: 'dubbing-video'}], index: 0},
            }));
        });

        fireEvent.click(screen.getByRole('button', {name: 'Play'}));
        expect(window.electronAPI.trackChange).toHaveBeenCalledWith({paused: false});
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

        const incrementAlice = document.querySelector('#regie-controller').querySelectorAll('[aria-label="increment"]')[0];
        fireEvent.click(incrementAlice);

        expect(window.electronAPI.trackChange).toHaveBeenCalledWith({
            players: [
                {id: 'p1', name: 'Alice', score: 3, enabled: true},
                {id: 'p2', name: 'Bob', score: 0, enabled: true},
            ],
        });
    });
});

describe('RegieLiveController - stop session', () => {
    beforeEach(() => {
        window.electronAPI = {trackChange: jest.fn(), sessionStop: jest.fn()};
    });
    afterEach(() => {
        delete window.session;
    });

    it('shows a confirmation dialog when the stop button is clicked, without stopping yet', () => {
        window.session = {
            track: {type: 'image', src: '/tmp/logo.png'},
            steps: [{id: 's1', name: 'Logo', type: 'image'}],
            index: 0,
        };
        render(<RegieLiveController/>);

        fireEvent.click(screen.getByRole('button', {name: 'Arrêter la session'}));

        expect(screen.getByText('Arrêter la session ?')).toBeTruthy();
        expect(window.electronAPI.sessionStop).not.toHaveBeenCalled();
    });

    it('calls session.stop() (real sessionStop IPC) when the confirm button is clicked', () => {
        window.session = {
            track: {type: 'image', src: '/tmp/logo.png'},
            steps: [{id: 's1', name: 'Logo', type: 'image'}],
            index: 0,
        };
        render(<RegieLiveController/>);

        fireEvent.click(screen.getByRole('button', {name: 'Arrêter la session'}));
        fireEvent.click(screen.getByRole('button', {name: 'Arrêter'}));

        expect(window.electronAPI.sessionStop).toHaveBeenCalledTimes(1);
    });

    it('closes the dialog without stopping when cancel is clicked', () => {
        window.session = {
            track: {type: 'image', src: '/tmp/logo.png'},
            steps: [{id: 's1', name: 'Logo', type: 'image'}],
            index: 0,
        };
        render(<RegieLiveController/>);

        fireEvent.click(screen.getByRole('button', {name: 'Arrêter la session'}));
        fireEvent.click(screen.getByRole('button', {name: 'Annuler'}));

        expect(window.electronAPI.sessionStop).not.toHaveBeenCalled();
        expect(screen.queryByText('Arrêter la session ?')).toBeNull();
    });
});
