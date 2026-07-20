import '../../../lib/i18n';
import {render, screen, fireEvent} from '@testing-library/react';
import Step from '../Step';

describe('Step form', () => {
    beforeEach(() => {
        window.electronAPI = {stepSave: jest.fn()};
    });

    it('shows validation errors for name and type when submitted empty', () => {
        render(<Step/>);
        fireEvent.click(screen.getByRole('button', {name: 'Enregistrer'}));

        expect(screen.getByText('Le nom est obligatoire.')).toBeTruthy();
        expect(screen.getByText('Veuillez sélectionner un type.')).toBeTruthy();
        expect(window.electronAPI.stepSave).not.toHaveBeenCalled();
    });

    it('delegates to the image variant validator once type=image is selected', () => {
        render(<Step/>);
        fireEvent.change(screen.getByLabelText('Nom'), {target: {value: 'Diapo'}});
        fireEvent.change(screen.getByLabelText('Type'), {target: {value: 'image'}});
        fireEvent.click(screen.getByRole('button', {name: 'Enregistrer'}));

        expect(screen.getByText('Un fichier est obligatoire.')).toBeTruthy();
        expect(window.electronAPI.stepSave).not.toHaveBeenCalled();
    });

    it('saves an image step once a file is provided', () => {
        render(<Step/>);
        fireEvent.change(screen.getByLabelText('Nom'), {target: {value: 'Diapo'}});
        fireEvent.change(screen.getByLabelText('Type'), {target: {value: 'image'}});
        const file = new File(['img'], 'slide.png', {type: 'image/png'});
        fireEvent.change(screen.getByLabelText('Image'), {target: {files: [file]}});
        fireEvent.click(screen.getByRole('button', {name: 'Enregistrer'}));

        expect(window.electronAPI.stepSave).toHaveBeenCalledWith(expect.objectContaining({
            name: 'Diapo',
            type: 'image',
            file,
        }));
    });

    it('delegates to the time variant validator and saves once impro/minutes are valid', () => {
        render(<Step/>);
        fireEvent.change(screen.getByLabelText('Nom'), {target: {value: 'Round 1'}});
        fireEvent.change(screen.getByLabelText('Type'), {target: {value: 'time'}});
        fireEvent.click(screen.getByRole('button', {name: 'Enregistrer'}));
        expect(screen.getAllByText("Doit être un nombre entier positif (1 ou plus).")).toHaveLength(2);

        fireEvent.change(screen.getByLabelText("Nombre d'impros"), {target: {value: '5'}});
        fireEvent.change(screen.getByLabelText('Minutes'), {target: {value: '3'}});
        fireEvent.click(screen.getByRole('button', {name: 'Enregistrer'}));

        expect(window.electronAPI.stepSave).toHaveBeenCalledWith(expect.objectContaining({
            name: 'Round 1',
            type: 'time',
            impro: '5',
            minutes: '3',
        }));
    });

    it('resets accumulated errors when the type is changed', () => {
        render(<Step/>);
        fireEvent.click(screen.getByRole('button', {name: 'Enregistrer'}));
        expect(screen.getByText('Le nom est obligatoire.')).toBeTruthy();

        fireEvent.change(screen.getByLabelText('Type'), {target: {value: 'time'}});
        expect(screen.queryByText('Le nom est obligatoire.')).toBeNull();
    });
});
