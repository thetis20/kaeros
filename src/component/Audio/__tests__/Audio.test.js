import '../../../lib/i18n';
import {render, screen, fireEvent} from '@testing-library/react';
import Audio from '../Audio';

jest.mock('../../Common/InputColor', () => function FakeInputColor({id, isInvalid, onChange}) {
    return (
        <div>
            <button type="button" data-testid={`${id}-pick`} onClick={() => onChange('#abcdef')}>pick</button>
            {isInvalid && <span data-testid={`${id}-invalid`}/>}
        </div>
    );
});

describe('Audio form', () => {
    beforeEach(() => {
        window.electronAPI = {audioSave: jest.fn()};
    });

    it('shows validation errors for name, color and missing file when submitted empty', () => {
        render(<Audio/>);
        fireEvent.click(screen.getByRole('button', {name: 'Enregistrer'}));

        expect(screen.getByText('Le nom est obligatoire.')).toBeTruthy();
        expect(screen.getByText("Merci de choisir une couleur (le blanc n'est pas autorisé).")).toBeTruthy();
        expect(screen.getByText('Un fichier audio est obligatoire.')).toBeTruthy();
        expect(window.electronAPI.audioSave).not.toHaveBeenCalled();
    });

    it('clears the file error as soon as a file is picked', () => {
        render(<Audio/>);
        fireEvent.click(screen.getByRole('button', {name: 'Enregistrer'}));
        expect(screen.getByText('Un fichier audio est obligatoire.')).toBeTruthy();

        const file = new File(['sound'], 'track.mp3', {type: 'audio/mpeg'});
        fireEvent.change(screen.getByLabelText('Fichier audio'), {target: {files: [file]}});
        expect(screen.queryByText('Un fichier audio est obligatoire.')).toBeNull();
        expect(screen.getByText('track.mp3')).toBeTruthy();
    });

    it('saves with name, picked color and file once valid', () => {
        render(<Audio/>);
        fireEvent.change(screen.getByLabelText('Nom du fichier audio'), {target: {value: 'Générique'}});
        fireEvent.click(screen.getByTestId('color-pick'));
        const file = new File(['sound'], 'track.mp3', {type: 'audio/mpeg'});
        fireEvent.change(screen.getByLabelText('Fichier audio'), {target: {files: [file]}});
        fireEvent.click(screen.getByRole('button', {name: 'Enregistrer'}));

        expect(window.electronAPI.audioSave).toHaveBeenCalledWith(expect.objectContaining({
            name: 'Générique',
            color: '#abcdef',
            file,
        }));
    });
});
