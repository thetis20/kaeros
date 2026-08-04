import '../../../lib/i18n';
import {render, screen, fireEvent} from '@testing-library/react';
import VideoStep, {validate} from '../VideoStep';

describe('VideoStep validate()', () => {
    it('requires a source file', () => {
        const errors = validate({}, (key) => key);
        expect(errors.file).toBe('step.form.error.file');
    });

    it('passes once a source is set', () => {
        const errors = validate({file: {name: 'clip.mp4'}}, (key) => key);
        expect(errors).toEqual({});
    });
});

describe('VideoStep component', () => {
    function renderStep(overrides = {}) {
        const value = {id: 'step-1', ...overrides};
        const setValue = jest.fn();
        const setErrors = jest.fn();
        render(<VideoStep value={value} setValue={setValue} errors={overrides.errors || {}} setErrors={setErrors}/>);
        return {value, setValue, setErrors};
    }

    it('shows the placeholder label when no file is set', () => {
        renderStep();
        expect(screen.getByText('Rechercher dans mes fichiers')).toBeTruthy();
    });

    it('picking a file updates the value and clears the file error', () => {
        const {setValue, setErrors} = renderStep({errors: {file: 'missing'}});
        const file = new File(['vid'], 'clip.mp4', {type: 'video/mp4'});
        fireEvent.change(screen.getByLabelText('Image'), {target: {files: [file]}});

        expect(setValue).toHaveBeenCalledWith(expect.objectContaining({file}));
        expect(setErrors).toHaveBeenCalledWith(expect.objectContaining({file: undefined}));
    });

    it('defaults the loop checkbox to unchecked', () => {
        renderStep();
        expect(screen.getByLabelText('Lecture en boucle').checked).toBe(false);
    });

    it('reflects an explicit loop value on the checkbox', () => {
        renderStep({loop: true});
        expect(screen.getByLabelText('Lecture en boucle').checked).toBe(true);
    });

    it('toggling the loop checkbox updates the value', () => {
        const {setValue} = renderStep({loop: false});
        fireEvent.click(screen.getByLabelText('Lecture en boucle'));

        expect(setValue).toHaveBeenCalledWith(expect.objectContaining({loop: true}));
    });
});
