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

    it('calls onCancel when Escape is pressed', () => {
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
        fireEvent.keyDown(screen.getByRole('dialog'), {key: 'Escape'});
        expect(onCancel).toHaveBeenCalledTimes(1);
        expect(onConfirm).not.toHaveBeenCalled();
    });

    it('does not let a keydown fired inside the dialog reach a document-level keydown listener', () => {
        const documentHandler = jest.fn();
        document.addEventListener('keydown', documentHandler);
        try {
            render(
                <ConfirmDialog
                    title="t"
                    message="m"
                    confirmLabel="Arrêter"
                    cancelLabel="Annuler"
                    onConfirm={() => {}}
                    onCancel={() => {}}
                />
            );
            fireEvent.keyDown(screen.getByRole('button', {name: 'Arrêter'}), {key: 'ArrowRight'});
            expect(documentHandler).not.toHaveBeenCalled();
        } finally {
            document.removeEventListener('keydown', documentHandler);
        }
    });

    it('calls onCancel when the overlay backdrop is clicked', () => {
        const onConfirm = jest.fn();
        const onCancel = jest.fn();
        const {container} = render(
            <ConfirmDialog
                title="t"
                message="m"
                confirmLabel="Arrêter"
                cancelLabel="Annuler"
                onConfirm={onConfirm}
                onCancel={onCancel}
            />
        );
        fireEvent.click(container.querySelector('.confirm-dialog-overlay'));
        expect(onCancel).toHaveBeenCalledTimes(1);
        expect(onConfirm).not.toHaveBeenCalled();
    });

    it('does not call onCancel when clicking inside the inner box', () => {
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
        fireEvent.click(screen.getByRole('dialog'));
        expect(onCancel).not.toHaveBeenCalled();
        expect(onConfirm).not.toHaveBeenCalled();
    });

    it('focuses the Cancel button after mount', () => {
        render(
            <ConfirmDialog
                title="t"
                message="m"
                confirmLabel="Arrêter"
                cancelLabel="Annuler"
                onConfirm={() => {}}
                onCancel={() => {}}
            />
        );
        expect(screen.getByRole('button', {name: 'Annuler'})).toHaveFocus();
    });
});
