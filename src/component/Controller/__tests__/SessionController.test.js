import '../../../lib/i18n';
import {render, screen, fireEvent} from '@testing-library/react';
import SessionController from '../SessionController';

describe('SessionController', () => {
    beforeEach(() => {
        window.electronAPI = {
            trackChange: jest.fn(),
            sessionNext: jest.fn(),
            sessionPrevious: jest.fn(),
            sessionToStep: jest.fn(),
        };
        delete window.session;
    });

    it('renders nothing when there is no active session', () => {
        const {container} = render(<SessionController/>);
        expect(container).toBeEmptyDOMElement();
    });

    it('renders nothing when display is false, even with an active session', () => {
        window.session = {track: {type: 'time', paused: true, status: 'STATUS_RUNNING', count: 1, impro: 5}, steps: [], index: 0};
        const {container} = render(<SessionController display={false}/>);
        expect(container).toBeEmptyDOMElement();
    });

    it('shows Play when the track is paused and Pause when it is running', () => {
        window.session = {track: {type: 'time', paused: true, status: 'STATUS_RUNNING', count: 1, impro: 5}, steps: [{id: 's1', name: 'Step 1'}], index: 0};
        render(<SessionController/>);

        fireEvent.click(screen.getByRole('button', {name: 'play'}));
        expect(window.electronAPI.trackChange).toHaveBeenCalledWith({paused: false});
    });

    it('jumps to an upcoming step when it is clicked in the step list', () => {
        window.session = {
            track: {type: 'time', paused: true, status: 'STATUS_RUNNING', count: 1, impro: 5},
            steps: [{id: 's1', name: 'Step 1'}, {id: 's2', name: 'Step 2'}],
            index: 0,
        };
        render(<SessionController/>);

        fireEvent.click(screen.getByText('Step 2'));
        expect(window.electronAPI.sessionToStep).toHaveBeenCalledWith(1);
    });

    it('reacts to keyboard shortcuts (space to play/pause, arrows to navigate)', () => {
        window.session = {
            track: {type: 'time', paused: true, status: 'STATUS_RUNNING', count: 3, impro: 5},
            steps: [{id: 's1', name: 'Step 1'}, {id: 's2', name: 'Step 2'}],
            index: 0,
        };
        render(<SessionController/>);

        fireEvent.keyDown(document, {key: ' '});
        expect(window.electronAPI.trackChange).toHaveBeenCalledWith({paused: false});

        fireEvent.keyDown(document, {key: 'ArrowRight'});
        expect(window.electronAPI.sessionNext).toHaveBeenCalledTimes(1);

        fireEvent.keyDown(document, {key: 'ArrowUp'});
        expect(window.electronAPI.trackChange).toHaveBeenCalledWith({count: 4});
    });

    it('does not navigate previous/minus past the boundaries', () => {
        window.session = {
            track: {type: 'time', paused: true, status: 'STATUS_RUNNING', count: 1, impro: 5},
            steps: [{id: 's1', name: 'Step 1'}],
            index: 0,
        };
        render(<SessionController/>);

        fireEvent.keyDown(document, {key: 'ArrowLeft'});
        expect(window.electronAPI.sessionPrevious).not.toHaveBeenCalled();

        fireEvent.keyDown(document, {key: 'ArrowDown'});
        expect(window.electronAPI.trackChange).not.toHaveBeenCalledWith(expect.objectContaining({count: 0}));
    });
});

describe('SessionController - stop session', () => {
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
        render(<SessionController/>);

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
        render(<SessionController/>);

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
        render(<SessionController/>);

        fireEvent.click(screen.getByRole('button', {name: 'Arrêter la session'}));
        fireEvent.click(screen.getByRole('button', {name: 'Annuler'}));

        expect(window.electronAPI.sessionStop).not.toHaveBeenCalled();
        expect(screen.queryByText('Arrêter la session ?')).toBeNull();
    });
});
