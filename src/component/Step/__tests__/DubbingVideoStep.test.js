import '../../../lib/i18n';
import {render, screen, fireEvent} from '@testing-library/react';
import DubbingVideoStep, {validate} from '../DubbingVideoStep';

const mockPlay = jest.fn();
jest.mock('../../Hook/useMediaPreview', () => () => ({mediaRef: {current: null}, play: mockPlay}));

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

    it('rejects a negative start offset', () => {
        const errors = validate({file: {name: 'clip.mp4'}, time: '2min', startOffsetMs: '-5'}, (key) => key);
        expect(errors.startOffsetMs).toBe('step.form.error.startOffset');
    });

    it('rejects a decimal start offset', () => {
        const errors = validate({file: {name: 'clip.mp4'}, time: '2min', startOffsetMs: '1.5'}, (key) => key);
        expect(errors.startOffsetMs).toBe('step.form.error.startOffset');
    });

    it('rejects an end offset lower than or equal to the start offset', () => {
        const errors = validate({file: {name: 'clip.mp4'}, time: '2min', startOffsetMs: '100', endOffsetMs: '100'}, (key) => key);
        expect(errors.endOffsetMs).toBe('step.form.error.endOffset');
    });

    it('rejects an end offset when it is lower than the implicit zero start', () => {
        const errors = validate({file: {name: 'clip.mp4'}, time: '2min', endOffsetMs: '0'}, (key) => key);
        expect(errors.endOffsetMs).toBe('step.form.error.endOffset');
    });

    it('accepts empty start and end offsets', () => {
        const errors = validate({file: {name: 'clip.mp4'}, time: '2min', startOffsetMs: '', endOffsetMs: ''}, (key) => key);
        expect(errors.startOffsetMs).toBeUndefined();
        expect(errors.endOffsetMs).toBeUndefined();
    });

    it('accepts a valid start/end offset pair', () => {
        const errors = validate({file: {name: 'clip.mp4'}, time: '2min', startOffsetMs: '100', endOffsetMs: '500'}, (key) => key);
        expect(errors.startOffsetMs).toBeUndefined();
        expect(errors.endOffsetMs).toBeUndefined();
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
        const {setValue} = renderStep({type: 'dubbing-video', name: ''});
        const file = new File(['vid'], 'Sketch final.mp4', {type: 'video/mp4'});
        fireEvent.change(screen.getByLabelText('Image'), {target: {files: [file]}});

        expect(setValue).toHaveBeenCalledWith(expect.objectContaining({name: 'Sketch final'}));
    });

    it('does not overwrite an already-set step name when a file is picked', () => {
        const {setValue} = renderStep({type: 'dubbing-video', name: 'Mon étape'});
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

    it('editing the start offset field updates the value and clears its error', () => {
        const {setValue, setErrors} = renderStep({startOffsetMs: '', errors: {startOffsetMs: 'missing'}});
        const startInput = document.querySelector('input[name="startOffsetMs"]');
        fireEvent.change(startInput, {target: {value: '100'}});

        expect(setValue).toHaveBeenCalledWith(expect.objectContaining({startOffsetMs: '100'}));
        expect(setErrors).toHaveBeenCalledWith(expect.objectContaining({startOffsetMs: undefined}));
    });

    it('editing the end offset field updates the value and clears its error', () => {
        const {setValue, setErrors} = renderStep({endOffsetMs: '', errors: {endOffsetMs: 'missing'}});
        const endInput = document.querySelector('input[name="endOffsetMs"]');
        fireEvent.change(endInput, {target: {value: '500'}});

        expect(setValue).toHaveBeenCalledWith(expect.objectContaining({endOffsetMs: '500'}));
        expect(setErrors).toHaveBeenCalledWith(expect.objectContaining({endOffsetMs: undefined}));
    });

    it('does not show the test-playback button when no source is selected yet', () => {
        renderStep();
        expect(screen.queryByText('Tester')).toBeNull();
    });

    it('shows the test-playback button once a source is selected', () => {
        renderStep({file: {name: 'clip.mp4'}});
        expect(screen.getByText('Tester')).toBeTruthy();
    });

    it('calls play() from the media preview hook with the current value when Tester is clicked', () => {
        mockPlay.mockClear();
        const {value} = renderStep({file: {name: 'clip.mp4'}, startOffsetMs: '100', endOffsetMs: '500'});
        fireEvent.click(screen.getByText('Tester'));

        expect(mockPlay).toHaveBeenCalledWith(value);
    });
});
