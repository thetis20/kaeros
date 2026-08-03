import '../../../lib/i18n';
import {render, screen, fireEvent} from '@testing-library/react';
import DubbingVideoStep, {validate} from '../DubbingVideoStep';

describe('DubbingVideoStep validate()', () => {
    it('requires both a source file and a time', () => {
        const errors = validate({}, (key) => key);
        expect(errors.file).toBe('step.form.error.file');
        expect(errors.time).toBe('step.form.error.time');
    });

    it('rejects a blank/whitespace-only time', () => {
        const errors = validate({file: {name: 'clip.mp4'}, time: '   '}, (key) => key);
        expect(errors.time).toBe('step.form.error.time');
    });

    it('passes once a source and a time are set', () => {
        const errors = validate({file: {name: 'clip.mp4'}, time: '2min'}, (key) => key);
        expect(errors).toEqual({});
    });
});

describe('DubbingVideoStep component', () => {
    function renderStep(overrides = {}) {
        const value = {id: 'step-1', ...overrides};
        const setValue = jest.fn();
        const setErrors = jest.fn();
        render(<DubbingVideoStep value={value} setValue={setValue} errors={overrides.errors || {}} setErrors={setErrors}/>);
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

    it('fills the empty step name with the picked file name (without extension) when a file is picked', () => {
        const {setValue} = renderStep({name: ''});
        const file = new File(['vid'], 'Sketch final.mp4', {type: 'video/mp4'});
        fireEvent.change(screen.getByLabelText('Image'), {target: {files: [file]}});

        expect(setValue).toHaveBeenCalledWith(expect.objectContaining({name: 'Sketch final'}));
    });

    it('does not overwrite an already-set step name when a file is picked', () => {
        const {setValue} = renderStep({name: 'Mon étape'});
        const file = new File(['vid'], 'clip.mp4', {type: 'video/mp4'});
        fireEvent.change(screen.getByLabelText('Image'), {target: {files: [file]}});

        expect(setValue).toHaveBeenCalledWith(expect.objectContaining({name: 'Mon étape'}));
    });

    it('fills the step name when it still equals the type default name (untouched since creation)', () => {
        const {setValue} = renderStep({type: 'dubbing-video', name: 'Nouveau doublage'});
        const file = new File(['vid'], 'Sketch final.mp4', {type: 'video/mp4'});
        fireEvent.change(screen.getByLabelText('Image'), {target: {files: [file]}});

        expect(setValue).toHaveBeenCalledWith(expect.objectContaining({name: 'Sketch final'}));
    });

    it('editing the time field updates the value and clears the time error', () => {
        const {setValue, setErrors} = renderStep({time: '', errors: {time: 'missing'}});
        const timeInput = document.querySelector('input[name="time"]');
        fireEvent.change(timeInput, {target: {value: '3min'}});

        expect(setValue).toHaveBeenCalledWith(expect.objectContaining({time: '3min'}));
        expect(setErrors).toHaveBeenCalledWith(expect.objectContaining({time: undefined}));
    });

    it('editing the description field updates the value without touching errors', () => {
        const {setValue, setErrors} = renderStep({description: ''});
        const descriptionInput = document.querySelector('textarea[name="description"]');
        fireEvent.change(descriptionInput, {target: {value: 'Une description'}});

        expect(setValue).toHaveBeenCalledWith(expect.objectContaining({description: 'Une description'}));
        expect(setErrors).not.toHaveBeenCalled();
    });
});
