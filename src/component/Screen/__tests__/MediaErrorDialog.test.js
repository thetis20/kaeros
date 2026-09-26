import '../../../lib/i18n';
import {render, screen, fireEvent} from '@testing-library/react';
import MediaErrorDialog from '../MediaErrorDialog';

describe('MediaErrorDialog', () => {
    it('groups faulty steps and audios under their own titles with name and message', () => {
        const issues = [
            {id: 'e1', kind: 'step', name: 'Etape 1', src: '/missing.mp4', code: 'missing'},
            {id: 'e2', kind: 'audio', name: 'Ambiance', src: '/amb.mp3', code: 'empty'},
        ];
        render(<MediaErrorDialog issues={issues} onClose={() => {}}/>);

        expect(screen.getByText('La session ne peut pas démarrer')).toBeTruthy();
        expect(screen.getByText('Étapes')).toBeTruthy();
        expect(screen.getByText('Musiques d\'ambiance')).toBeTruthy();
        expect(screen.getByText(/Etape 1/)).toBeTruthy();
        expect(screen.getByText(/Fichier introuvable : \/missing\.mp4/)).toBeTruthy();
        expect(screen.getByText(/Ambiance/)).toBeTruthy();
        expect(screen.getByText(/Fichier vide \(0 octet\) : \/amb\.mp3/)).toBeTruthy();
    });

    it('hides a group when it has no entries', () => {
        const issues = [{id: 'e1', kind: 'step', name: 'Etape 1', src: '/missing.mp4', code: 'missing'}];
        render(<MediaErrorDialog issues={issues} onClose={() => {}}/>);

        expect(screen.getByText('Étapes')).toBeTruthy();
        expect(screen.queryByText('Musiques d\'ambiance')).toBeNull();
    });

    it('closes when the close button is clicked', () => {
        const onClose = jest.fn();
        render(<MediaErrorDialog issues={[{id: 'e1', kind: 'step', name: 'Etape 1', src: '/a', code: 'missing'}]} onClose={onClose}/>);

        fireEvent.click(screen.getByRole('button', {name: 'Fermer'}));

        expect(onClose).toHaveBeenCalledTimes(1);
    });

    it('closes on Escape', () => {
        const onClose = jest.fn();
        render(<MediaErrorDialog issues={[{id: 'e1', kind: 'step', name: 'Etape 1', src: '/a', code: 'missing'}]} onClose={onClose}/>);

        fireEvent.keyDown(screen.getByRole('dialog'), {key: 'Escape'});

        expect(onClose).toHaveBeenCalledTimes(1);
    });

    it('closes when the overlay backdrop is clicked, but not when clicking inside the box', () => {
        const onClose = jest.fn();
        const {container} = render(
            <MediaErrorDialog issues={[{id: 'e1', kind: 'step', name: 'Etape 1', src: '/a', code: 'missing'}]} onClose={onClose}/>
        );

        fireEvent.click(screen.getByRole('dialog'));
        expect(onClose).not.toHaveBeenCalled();

        fireEvent.click(container.querySelector('.confirm-dialog-overlay'));
        expect(onClose).toHaveBeenCalledTimes(1);
    });

    it('focuses the close button after mount', () => {
        render(<MediaErrorDialog issues={[{id: 'e1', kind: 'step', name: 'Etape 1', src: '/a', code: 'missing'}]} onClose={() => {}}/>);

        expect(screen.getByRole('button', {name: 'Fermer'})).toHaveFocus();
    });
});
