import '../../../lib/i18n';
import {render, screen, fireEvent} from '@testing-library/react';
import Folder from '../Folder';

jest.mock('../../Common/InputColor', () => function FakeInputColor({id, isInvalid, onChange}) {
    return (
        <div>
            <button type="button" data-testid={`${id}-pick`} onClick={() => onChange('#654321')}>pick</button>
            {isInvalid && <span data-testid={`${id}-invalid`}/>}
        </div>
    );
});

describe('Folder form', () => {
    beforeEach(() => {
        window.electronAPI = {folderSave: jest.fn()};
    });

    it('shows validation errors and does not save when submitted empty', () => {
        render(<Folder/>);
        fireEvent.click(screen.getByRole('button', {name: 'Enregistrer'}));

        expect(screen.getByText('Le nom est obligatoire.')).toBeTruthy();
        expect(screen.getByText("Merci de choisir une couleur (le blanc n'est pas autorisé).")).toBeTruthy();
        expect(window.electronAPI.folderSave).not.toHaveBeenCalled();
    });

    it('clears the color error once a real color is picked', () => {
        render(<Folder/>);
        fireEvent.click(screen.getByRole('button', {name: 'Enregistrer'}));
        expect(screen.getByText("Merci de choisir une couleur (le blanc n'est pas autorisé).")).toBeTruthy();

        fireEvent.click(screen.getByTestId('color-pick'));
        expect(screen.queryByText("Merci de choisir une couleur (le blanc n'est pas autorisé).")).toBeNull();
    });

    it('saves with the entered name and picked color once valid', () => {
        render(<Folder/>);
        fireEvent.change(screen.getByLabelText('Nom du dossier'), {target: {value: 'Playlist rock'}});
        fireEvent.click(screen.getByTestId('color-pick'));
        fireEvent.click(screen.getByRole('button', {name: 'Enregistrer'}));

        expect(window.electronAPI.folderSave).toHaveBeenCalledWith(expect.objectContaining({
            name: 'Playlist rock',
            color: '#654321',
        }));
    });
});
