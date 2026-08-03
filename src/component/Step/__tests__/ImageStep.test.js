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

    it('picking a file updates the value and clears the file error', () => {
        const {setValue, setErrors} = renderStep({errors: {file: 'missing'}});
        const file = new File(['img'], 'photo.png', {type: 'image/png'});
        fireEvent.change(screen.getByLabelText('Image'), {target: {files: [file]}});

        expect(setValue).toHaveBeenCalledWith(expect.objectContaining({file}));
        expect(setErrors).toHaveBeenCalledWith(expect.objectContaining({file: undefined}));
    });

    it('fills the empty step name with the picked file name (without extension) when a file is picked', () => {
        const {setValue} = renderStep({name: ''});
        const file = new File(['img'], 'Sketch final.png', {type: 'image/png'});
        fireEvent.change(screen.getByLabelText('Image'), {target: {files: [file]}});

        expect(setValue).toHaveBeenCalledWith(expect.objectContaining({name: 'Sketch final'}));
    });

    it('does not overwrite an already-set step name when a file is picked', () => {
        const {setValue} = renderStep({name: 'Mon étape'});
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
