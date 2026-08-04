import {render, screen, fireEvent} from '@testing-library/react';
import ConfirmDialog from '../ConfirmDialog';

describe('ConfirmDialog', () => {
    it('renders the title and message', () => {
        render(
            <ConfirmDialog
                title="Arrêter la session ?"
                message="La diffusion sera coupée."
                confirmLabel="Arrêter"
                cancelLabel="Annuler"
                onConfirm={() => {}}
                onCancel={() => {}}
            />
        );
        expect(screen.getByText('Arrêter la session ?')).toBeTruthy();
        expect(screen.getByText('La diffusion sera coupée.')).toBeTruthy();
    });

    it('calls onConfirm (not onCancel) when the confirm button is clicked', () => {
        const onConfirm = jest.fn();
        const onCancel = jest.fn();
        render(
            <ConfirmDialog
                title="t"
                message="m"
                confirmLabel="Arrêter"
                cancelLabel="Annuler"
                onConfirm={onConfirm}
                onCancel={onCancel}
            />
        );
        fireEvent.click(screen.getByRole('button', {name: 'Arrêter'}));
        expect(onConfirm).toHaveBeenCalledTimes(1);
        expect(onCancel).not.toHaveBeenCalled();
    });

    it('calls onCancel (not onConfirm) when the cancel button is clicked', () => {
        const onConfirm = jest.fn();
        const onCancel = jest.fn();
        render(
            <ConfirmDialog
                title="t"
                message="m"
                confirmLabel="Arrêter"
                cancelLabel="Annuler"
                onConfirm={onConfirm}
                onCancel={onCancel}
            />
        );
        fireEvent.click(screen.getByRole('button', {name: 'Annuler'}));
        expect(onCancel).toHaveBeenCalledTimes(1);
        expect(onConfirm).not.toHaveBeenCalled();
    });
});
