import '../../../lib/i18n';
import {render, screen, fireEvent} from '@testing-library/react';
import UnsavedChangesDialog from '../UnsavedChangesDialog';

describe('UnsavedChangesDialog', () => {
    function setup() {
        const handlers = {onSave: jest.fn(), onDiscard: jest.fn(), onCancel: jest.fn()};
        render(<UnsavedChangesDialog {...handlers}/>);
        return handlers;
    }

    it('calls only onSave when "Continuer en enregistrant" is clicked', () => {
        const {onSave, onDiscard, onCancel} = setup();
        fireEvent.click(screen.getByRole('button', {name: 'Continuer en enregistrant'}));
        expect(onSave).toHaveBeenCalledTimes(1);
        expect(onDiscard).not.toHaveBeenCalled();
        expect(onCancel).not.toHaveBeenCalled();
    });

    it('calls only onDiscard when "Continuer sans enregistrer" is clicked', () => {
        const {onSave, onDiscard, onCancel} = setup();
        fireEvent.click(screen.getByRole('button', {name: 'Continuer sans enregistrer'}));
        expect(onDiscard).toHaveBeenCalledTimes(1);
        expect(onSave).not.toHaveBeenCalled();
        expect(onCancel).not.toHaveBeenCalled();
    });

    it('calls only onCancel when "Annuler" is clicked', () => {
        const {onSave, onDiscard, onCancel} = setup();
        fireEvent.click(screen.getByRole('button', {name: 'Annuler'}));
        expect(onCancel).toHaveBeenCalledTimes(1);
        expect(onSave).not.toHaveBeenCalled();
        expect(onDiscard).not.toHaveBeenCalled();
    });

    it('calls onCancel when Escape is pressed', () => {
        const {onSave, onDiscard, onCancel} = setup();
        fireEvent.keyDown(screen.getByRole('dialog'), {key: 'Escape'});
        expect(onCancel).toHaveBeenCalledTimes(1);
        expect(onSave).not.toHaveBeenCalled();
        expect(onDiscard).not.toHaveBeenCalled();
    });

    it('focuses the Cancel button after mount', () => {
        setup();
        expect(screen.getByRole('button', {name: 'Annuler'})).toHaveFocus();
    });
});
