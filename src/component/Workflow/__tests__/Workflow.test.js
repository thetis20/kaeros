import '../../../lib/i18n';
import {render, screen, fireEvent} from '@testing-library/react';
import Workflow from '../Workflow';

jest.mock('../../Common/InputColor', () => function FakeInputColor({id, isInvalid, onChange}) {
    return (
        <div>
            <button type="button" data-testid={`${id}-pick`} onClick={() => onChange('#123456')}>pick</button>
            {isInvalid && <span data-testid={`${id}-invalid`}/>}
        </div>
    );
});

describe('Workflow form', () => {
    beforeEach(() => {
        window.electronAPI = {save: jest.fn()};
    });

    it('shows validation errors and does not save when submitted empty', () => {
        render(<Workflow/>);
        fireEvent.click(screen.getByRole('button', {name: 'Enregistrer'}));

        expect(screen.getByText('Le nom est obligatoire.')).toBeTruthy();
        expect(screen.getByText("Merci de choisir une couleur (le blanc n'est pas autorisé).")).toBeTruthy();
        expect(window.electronAPI.save).not.toHaveBeenCalled();
    });

    it('clears the name error as soon as the user types', () => {
        render(<Workflow/>);
        fireEvent.click(screen.getByRole('button', {name: 'Enregistrer'}));
        expect(screen.getByText('Le nom est obligatoire.')).toBeTruthy();

        fireEvent.change(screen.getByLabelText('Nom'), {target: {value: 'Impro du soir'}});
        expect(screen.queryByText('Le nom est obligatoire.')).toBeNull();
    });

    it('saves with the entered name and picked color once valid', () => {
        render(<Workflow/>);
        fireEvent.change(screen.getByLabelText('Nom'), {target: {value: 'Impro du soir'}});
        fireEvent.click(screen.getByTestId('color-pick'));
        fireEvent.click(screen.getByRole('button', {name: 'Enregistrer'}));

        expect(window.electronAPI.save).toHaveBeenCalledWith(expect.objectContaining({
            name: 'Impro du soir',
            color: '#123456',
        }));
        expect(screen.queryByText('Le nom est obligatoire.')).toBeNull();
    });
});
