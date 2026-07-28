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
