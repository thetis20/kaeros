import '../../../lib/i18n';
import {act, render, screen, fireEvent, within} from '@testing-library/react';
import MusiqueScreen from '../MusiqueScreen';

const TAGS = [
    {id: 'tag1', name: 'Musique', color: '#4C6EFF'},
    {id: 'tag2', name: 'Bruitage', color: '#F76707'},
    {id: 'tag3', name: 'Disco', color: '#AE3EC9'},
];

describe('MusiqueScreen', () => {
    beforeEach(() => {
        window.electronAPI = {
            trackFetch: jest.fn(),
            trackSave: jest.fn(),
            trackRemove: jest.fn(),
            tagFetch: jest.fn(),
            tagCreate: jest.fn(),
        };
    });

    function seedTracks(tracks) {
        act(() => {
            document.dispatchEvent(new CustomEvent('track-onchange', {detail: tracks}));
        });
    }

    function seedTags(tags) {
        act(() => {
            document.dispatchEvent(new CustomEvent('tag-onchange', {detail: tags}));
        });
    }

    function selectTag(name) {
        const input = screen.getByPlaceholderText('Rechercher ou créer un tag');
        fireEvent.focus(input);
        fireEvent.change(input, {target: {value: name}});
        const dropdown = document.querySelector('.tag-multiselect-dropdown');
        fireEvent.mouseDown(within(dropdown).getByRole('button', {name}));
    }

    it('shows validation errors and does not save when the add form is submitted empty', () => {
        render(<MusiqueScreen/>);
        fireEvent.click(screen.getByRole('button', {name: 'Enregistrer'}));

        expect(screen.getByText('Le nom est obligatoire.')).toBeTruthy();
        expect(screen.getByText('Veuillez sélectionner au moins un tag.')).toBeTruthy();
        expect(screen.getByText('Un fichier audio est obligatoire.')).toBeTruthy();
        expect(window.electronAPI.trackSave).not.toHaveBeenCalled();
    });

    it('shows a validation error and does not save when the start offset is negative', () => {
        render(<MusiqueScreen/>);
        seedTags(TAGS);
        fireEvent.change(screen.getByLabelText('Nom'), {target: {value: 'Générique'}});
        selectTag('Disco');
        const file = new File(['sound'], 'track.mp3', {type: 'audio/mpeg'});
        fireEvent.change(screen.getByLabelText('Fichier audio'), {target: {files: [file]}});
        fireEvent.change(screen.getByLabelText('Démarrage (ms)'), {target: {value: '-1'}});
        fireEvent.click(screen.getByRole('button', {name: 'Enregistrer'}));

        expect(screen.getByText('Le point de départ doit être un nombre entier positif (en millisecondes).')).toBeTruthy();
        expect(window.electronAPI.trackSave).not.toHaveBeenCalled();
    });

    it('saves a new track with the entered start offset in milliseconds', () => {
        render(<MusiqueScreen/>);
        seedTags(TAGS);
        fireEvent.change(screen.getByLabelText('Nom'), {target: {value: 'Générique'}});
        selectTag('Disco');
        const file = new File(['sound'], 'track.mp3', {type: 'audio/mpeg'});
        fireEvent.change(screen.getByLabelText('Fichier audio'), {target: {files: [file]}});
        fireEvent.change(screen.getByLabelText('Démarrage (ms)'), {target: {value: '250'}});
        fireEvent.click(screen.getByRole('button', {name: 'Enregistrer'}));

        expect(window.electronAPI.trackSave).toHaveBeenCalledWith(expect.objectContaining({
            startOffsetMs: '250',
        }));
    });

    it('does not show the test-playback button when no audio source is selected yet', () => {
        render(<MusiqueScreen/>);
        expect(screen.queryByRole('button', {name: 'Tester'})).toBeNull();
    });

    it('seeks the preview player to the entered offset and plays it when Tester is clicked', () => {
        render(<MusiqueScreen/>);
        global.URL.createObjectURL = jest.fn(() => 'blob:mock-url');
        global.URL.revokeObjectURL = jest.fn();
        const file = new File(['sound'], 'track.mp3', {type: 'audio/mpeg'});
        fireEvent.change(screen.getByLabelText('Fichier audio'), {target: {files: [file]}});
        fireEvent.change(screen.getByLabelText('Démarrage (ms)'), {target: {value: '250'}});

        fireEvent.click(screen.getByRole('button', {name: 'Tester'}));
        const previewEl = document.querySelector('audio');
        const playSpy = jest.spyOn(previewEl, 'play').mockImplementation(() => Promise.resolve());
        fireEvent(previewEl, new Event('loadedmetadata'));

        expect(global.URL.createObjectURL).toHaveBeenCalledWith(file);
        expect(previewEl.currentTime).toBe(0.25);
        expect(playSpy).toHaveBeenCalled();
    });

    it('saves a new track with the entered name, selected tags and picked file', () => {
        render(<MusiqueScreen/>);
        seedTags(TAGS);
        fireEvent.change(screen.getByLabelText('Nom'), {target: {value: 'Générique'}});
        selectTag('Disco');
        const file = new File(['sound'], 'track.mp3', {type: 'audio/mpeg'});
        fireEvent.change(screen.getByLabelText('Fichier audio'), {target: {files: [file]}});
        fireEvent.click(screen.getByRole('button', {name: 'Enregistrer'}));

        expect(window.electronAPI.trackSave).toHaveBeenCalledWith(expect.objectContaining({
            name: 'Générique',
            tags: ['tag3'],
            file,
        }));
        expect(window.electronAPI.trackSave.mock.calls[0][0]).not.toHaveProperty('id');
    });

    it('allows selecting several tags on the same track', () => {
        render(<MusiqueScreen/>);
        seedTags(TAGS);
        fireEvent.change(screen.getByLabelText('Nom'), {target: {value: 'Générique'}});
        selectTag('Disco');
        selectTag('Bruitage');
        const file = new File(['sound'], 'track.mp3', {type: 'audio/mpeg'});
        fireEvent.change(screen.getByLabelText('Fichier audio'), {target: {files: [file]}});
        fireEvent.click(screen.getByRole('button', {name: 'Enregistrer'}));

        expect(window.electronAPI.trackSave).toHaveBeenCalledWith(expect.objectContaining({
            tags: ['tag3', 'tag2'],
        }));
    });

    it('fills the empty name field with the picked file name (without extension)', () => {
        render(<MusiqueScreen/>);
        const file = new File(['sound'], 'Générique 1.mp3', {type: 'audio/mpeg'});
        fireEvent.change(screen.getByLabelText('Fichier audio'), {target: {files: [file]}});

        expect(screen.getByLabelText('Nom').value).toBe('Générique 1');
    });

    it('does not overwrite an already-entered name when a file is picked', () => {
        render(<MusiqueScreen/>);
        fireEvent.change(screen.getByLabelText('Nom'), {target: {value: 'Mon titre'}});
        const file = new File(['sound'], 'track.mp3', {type: 'audio/mpeg'});
        fireEvent.change(screen.getByLabelText('Fichier audio'), {target: {files: [file]}});

        expect(screen.getByLabelText('Nom').value).toBe('Mon titre');
    });

    it('filters the track list by tag when a tab is clicked', () => {
        render(<MusiqueScreen/>);
        seedTags(TAGS);
        seedTracks([
            {id: 't1', name: 'Générique', src: '/tmp/t1.mp3', tags: ['tag1']},
            {id: 't2', name: 'Applaudissements', src: '/tmp/t2.mp3', tags: ['tag2']},
        ]);

        expect(screen.getByText('Générique')).toBeTruthy();
        expect(screen.getByText('Applaudissements')).toBeTruthy();

        fireEvent.click(screen.getByRole('button', {name: 'Bruitage'}));

        expect(screen.queryByText('Générique')).toBeNull();
        expect(screen.getByText('Applaudissements')).toBeTruthy();
    });

    it('populates the form for editing and calls trackSave with the existing id on submit', () => {
        render(<MusiqueScreen/>);
        seedTags(TAGS);
        seedTracks([
            {id: 't1', name: 'Générique', src: '/tmp/t1.mp3', tags: ['tag1'], createdAt: '2024-01-01', updatedAt: '2024-01-01'},
        ]);

        fireEvent.click(screen.getByRole('button', {name: 'Modifier'}));
        expect(screen.getByLabelText('Nom').value).toBe('Générique');

        fireEvent.change(screen.getByLabelText('Nom'), {target: {value: 'Générique Remix'}});
        fireEvent.click(screen.getByRole('button', {name: 'Enregistrer'}));

        expect(window.electronAPI.trackSave).toHaveBeenCalledWith(expect.objectContaining({
            id: 't1',
            name: 'Générique Remix',
            src: '/tmp/t1.mp3',
            tags: ['tag1'],
        }));
    });

    it('removes a track when its delete button is clicked', () => {
        render(<MusiqueScreen/>);
        seedTracks([
            {id: 't1', name: 'Générique', src: '/tmp/t1.mp3', tags: ['tag1']},
        ]);

        fireEvent.click(screen.getByRole('button', {name: 'Supprimer'}));

        expect(window.electronAPI.trackRemove).toHaveBeenCalledWith('t1');
    });
});
