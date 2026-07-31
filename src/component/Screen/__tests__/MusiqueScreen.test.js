import '../../../lib/i18n';
import {act, render, screen, fireEvent} from '@testing-library/react';
import MusiqueScreen from '../MusiqueScreen';

describe('MusiqueScreen', () => {
    beforeEach(() => {
        window.electronAPI = {
            trackFetch: jest.fn(),
            trackSave: jest.fn(),
            trackRemove: jest.fn(),
        };
    });

    function seedTracks(tracks) {
        act(() => {
            document.dispatchEvent(new CustomEvent('track-onchange', {detail: tracks}));
        });
    }

    it('shows validation errors and does not save when the add form is submitted empty', () => {
        render(<MusiqueScreen/>);
        fireEvent.click(screen.getByRole('button', {name: 'Enregistrer'}));

        expect(screen.getByText('Le nom est obligatoire.')).toBeTruthy();
        expect(screen.getByText('Un fichier audio est obligatoire.')).toBeTruthy();
        expect(window.electronAPI.trackSave).not.toHaveBeenCalled();
    });

    it('saves a new track with the entered name, selected tag, picked file and a tag-derived color', () => {
        render(<MusiqueScreen/>);
        fireEvent.change(screen.getByLabelText('Nom'), {target: {value: 'Générique'}});
        fireEvent.change(screen.getByLabelText('Tag'), {target: {value: 'Disco'}});
        const file = new File(['sound'], 'track.mp3', {type: 'audio/mpeg'});
        fireEvent.change(document.getElementById('track-src'), {target: {files: [file]}});
        fireEvent.click(screen.getByRole('button', {name: 'Enregistrer'}));

        expect(window.electronAPI.trackSave).toHaveBeenCalledWith(expect.objectContaining({
            name: 'Générique',
            tag: 'Disco',
            file,
            color: '#AE3EC9',
        }));
        expect(window.electronAPI.trackSave.mock.calls[0][0]).not.toHaveProperty('id');
    });

    it('filters the track list by tag when a tab is clicked', () => {
        render(<MusiqueScreen/>);
        seedTracks([
            {id: 't1', name: 'Générique', src: '/tmp/t1.mp3', tag: 'Musique', color: '#4C6EFF'},
            {id: 't2', name: 'Applaudissements', src: '/tmp/t2.mp3', tag: 'Bruitage', color: '#F76707'},
        ]);

        expect(screen.getByText('Générique')).toBeTruthy();
        expect(screen.getByText('Applaudissements')).toBeTruthy();

        fireEvent.click(screen.getByRole('button', {name: 'Bruitage'}));

        expect(screen.queryByText('Générique')).toBeNull();
        expect(screen.getByText('Applaudissements')).toBeTruthy();
    });

    it('populates the form for editing and calls trackSave with the existing id on submit', () => {
        render(<MusiqueScreen/>);
        seedTracks([
            {id: 't1', name: 'Générique', src: '/tmp/t1.mp3', tag: 'Musique', color: '#4C6EFF', createdAt: '2024-01-01', updatedAt: '2024-01-01'},
        ]);

        fireEvent.click(screen.getByRole('button', {name: 'Modifier'}));
        expect(screen.getByLabelText('Nom').value).toBe('Générique');

        fireEvent.change(screen.getByLabelText('Nom'), {target: {value: 'Générique Remix'}});
        fireEvent.click(screen.getByRole('button', {name: 'Enregistrer'}));

        expect(window.electronAPI.trackSave).toHaveBeenCalledWith(expect.objectContaining({
            id: 't1',
            name: 'Générique Remix',
            src: '/tmp/t1.mp3',
            color: '#4C6EFF',
        }));
    });

    it('removes a track when its delete button is clicked', () => {
        render(<MusiqueScreen/>);
        seedTracks([
            {id: 't1', name: 'Générique', src: '/tmp/t1.mp3', tag: 'Musique', color: '#4C6EFF'},
        ]);

        fireEvent.click(screen.getByRole('button', {name: 'Supprimer'}));

        expect(window.electronAPI.trackRemove).toHaveBeenCalledWith('t1');
    });
});
