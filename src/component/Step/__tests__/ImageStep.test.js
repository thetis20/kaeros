import '../../../lib/i18n';
import {render, screen, fireEvent} from '@testing-library/react';
import ImageStep, {validate} from '../ImageStep';

describe('ImageStep validate()', () => {
    it('requires a source file', () => {
        const errors = validate({}, (key) => key);
        expect(errors.file).toBe('step.form.error.file');
    });

    it('passes once a source is set', () => {
        const errors = validate({file: {name: 'photo.png'}}, (key) => key);
        expect(errors).toEqual({});
    });
});

describe('ImageStep component', () => {
    function renderStep(overrides = {}) {
        const value = {id: 'step-1', ...overrides};
        const setValue = jest.fn();
        const setErrors = jest.fn();
        render(<ImageStep value={value} setValue={setValue} errors={overrides.errors || {}} setErrors={setErrors}/>);
        return {value, setValue, setErrors};
    }

    it('shows the placeholder label when no file is set', () => {
        renderStep();
        expect(screen.getByText('Rechercher dans mes fichiers')).toBeTruthy();
    });

    it('shows a range input defaulting to 100', () => {
        renderStep();
        const range = screen.getByLabelText("Taille de l'image");
        expect(range.type).toBe('range');
        expect(range.value).toBe('100');
        expect(screen.getByText('100 %')).toBeTruthy();
    });

    it('changing the range calls setValue with a numeric scale', () => {
        const {setValue} = renderStep();
        fireEvent.change(screen.getByLabelText("Taille de l'image"), {target: {value: '45'}});
        expect(setValue).toHaveBeenCalledWith(expect.objectContaining({scale: 45}));
    });

    it('disables the test button without file or src', () => {
        renderStep();
        expect(screen.getByRole('button', {name: 'Tester'}).disabled).toBe(true);
    });

    it('opens the preview dialog with src, closes it with Close and Escape', () => {
        renderStep({src: '/tmp/photo.png', name: 'Photo'});
        const button = screen.getByRole('button', {name: 'Tester'});
        expect(button.disabled).toBe(false);

        fireEvent.click(button);
        expect(screen.getByRole('dialog')).toBeTruthy();
        fireEvent.click(screen.getByRole('button', {name: 'Fermer'}));
        expect(screen.queryByRole('dialog')).toBeNull();

        fireEvent.click(button);
        fireEvent.keyDown(screen.getByRole('dialog'), {key: 'Escape'});
        expect(screen.queryByRole('dialog')).toBeNull();
    });

    it('picking a file updates the value and clears the file error', () => {
        const {setValue, setErrors} = renderStep({errors: {file: 'missing'}});
        const file = new File(['img'], 'photo.png', {type: 'image/png'});
        fireEvent.change(screen.getByLabelText('Image'), {target: {files: [file]}});

        expect(setValue).toHaveBeenCalledWith(expect.objectContaining({file}));
        expect(setErrors).toHaveBeenCalledWith(expect.objectContaining({file: undefined}));
    });

    it('fills the empty step name with the picked file name (without extension) when a file is picked', () => {
        const {setValue} = renderStep({type: 'image', name: ''});
        const file = new File(['img'], 'Sketch final.png', {type: 'image/png'});
        fireEvent.change(screen.getByLabelText('Image'), {target: {files: [file]}});

        expect(setValue).toHaveBeenCalledWith(expect.objectContaining({name: 'Sketch final'}));
    });

    it('does not overwrite an already-set step name when a file is picked', () => {
        const {setValue} = renderStep({type: 'image', name: 'Mon étape'});
        const file = new File(['img'], 'photo.png', {type: 'image/png'});
        fireEvent.change(screen.getByLabelText('Image'), {target: {files: [file]}});

        expect(setValue).toHaveBeenCalledWith(expect.objectContaining({name: 'Mon étape'}));
    });

    it('fills the step name when it still equals the type default name (untouched since creation)', () => {
        const {setValue} = renderStep({type: 'image', name: 'Nouvelle image'});
        const file = new File(['img'], 'Sketch final.png', {type: 'image/png'});
        fireEvent.change(screen.getByLabelText('Image'), {target: {files: [file]}});

        expect(setValue).toHaveBeenCalledWith(expect.objectContaining({name: 'Sketch final'}));
    });
});
