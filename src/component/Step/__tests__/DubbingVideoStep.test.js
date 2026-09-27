import '../../../lib/i18n';
import {render, screen, fireEvent} from '@testing-library/react';
import DubbingVideoStep, {validate} from '../DubbingVideoStep';
import {previewWindow} from '../../../lib/mediaWindow';

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

    it('accepts a fadeOutMs of 0 (hard cut)', () => {
        const errors = validate({file: {name: 'clip.mp4'}, time: '2min', fadeOutMs: '0'}, (key) => key);
        expect(errors.fadeOutMs).toBeUndefined();
    });

    it('accepts a fadeOutMs of 2000', () => {
        const errors = validate({file: {name: 'clip.mp4'}, time: '2min', fadeOutMs: '2000'}, (key) => key);
        expect(errors.fadeOutMs).toBeUndefined();
    });

    it('rejects a negative fadeOutMs', () => {
        const errors = validate({file: {name: 'clip.mp4'}, time: '2min', fadeOutMs: '-1'}, (key) => key);
        expect(errors.fadeOutMs).toBe('step.form.error.fadeOut');
    });

    it('rejects a decimal fadeOutMs', () => {
        const errors = validate({file: {name: 'clip.mp4'}, time: '2min', fadeOutMs: '1.5'}, (key) => key);
        expect(errors.fadeOutMs).toBe('step.form.error.fadeOut');
    });

    it('accepts a fadeInMs of 0 (hard cut)', () => {
        const errors = validate({file: {name: 'clip.mp4'}, time: '2min', fadeInMs: '0'}, (key) => key);
        expect(errors.fadeInMs).toBeUndefined();
    });

    it('accepts a fadeInMs of 2000', () => {
        const errors = validate({file: {name: 'clip.mp4'}, time: '2min', fadeInMs: '2000'}, (key) => key);
        expect(errors.fadeInMs).toBeUndefined();
    });

    it('rejects a negative fadeInMs', () => {
        const errors = validate({file: {name: 'clip.mp4'}, time: '2min', fadeInMs: '-1'}, (key) => key);
        expect(errors.fadeInMs).toBe('step.form.error.fadeIn');
    });

    it('rejects a decimal fadeInMs', () => {
        const errors = validate({file: {name: 'clip.mp4'}, time: '2min', fadeInMs: '1.5'}, (key) => key);
        expect(errors.fadeInMs).toBe('step.form.error.fadeIn');
    });
});

describe('DubbingVideoStep component', () => {
    function renderStep(overrides = {}) {
        const value = {id: 'step-1', ...overrides};
        const setValue = jest.fn();
        const setErrors = jest.fn();
        const errors = overrides.errors || {};
        const utils = render(<DubbingVideoStep value={value} setValue={setValue} errors={errors} setErrors={setErrors}/>);
        return {value, setValue, setErrors, errors, ...utils};
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

    it('shows the current start offset value, defaulting to 0', () => {
        renderStep();
        expect(screen.getByText('Début : 0 ms')).toBeTruthy();
    });

    it('shows the current end offset value when set', () => {
        renderStep({endOffsetMs: '9000'});
        expect(screen.getByText('Fin : 9000 ms')).toBeTruthy();
    });

    it('shows the "until the end" label when the end offset is empty', () => {
        renderStep({endOffsetMs: ''});
        expect(screen.getByText("Fin : jusqu'à la fin de la vidéo")).toBeTruthy();
    });

    it('does not render the offset fields or the popin while it is closed', () => {
        renderStep();
        expect(document.querySelector('input[name="startOffsetMs"]')).toBeNull();
        expect(document.querySelector('input[name="endOffsetMs"]')).toBeNull();
        expect(screen.queryByRole('dialog')).toBeNull();
    });

    it('opens the start offset popin when its gear button is clicked', () => {
        renderStep();
        fireEvent.click(screen.getByLabelText("Configurer le début de l'extrait"));

        expect(screen.getByRole('dialog')).toBeTruthy();
        expect(document.querySelector('input[name="startOffsetMs"]')).toBeTruthy();
        expect(document.querySelector('input[name="endOffsetMs"]')).toBeNull();
    });

    it('opens the end offset popin when its gear button is clicked', () => {
        renderStep();
        fireEvent.click(screen.getByLabelText("Configurer la fin de l'extrait"));

        expect(screen.getByRole('dialog')).toBeTruthy();
        expect(document.querySelector('input[name="endOffsetMs"]')).toBeTruthy();
        expect(document.querySelector('input[name="startOffsetMs"]')).toBeNull();
    });

    it('closes the popin when its close button is clicked', () => {
        renderStep();
        fireEvent.click(screen.getByLabelText("Configurer le début de l'extrait"));
        expect(screen.getByRole('dialog')).toBeTruthy();

        fireEvent.click(screen.getByText('Fermer'));
        expect(screen.queryByRole('dialog')).toBeNull();
    });

    it('editing the start offset field from the popin updates the value and clears its error', () => {
        const {setValue, setErrors} = renderStep({startOffsetMs: '', errors: {startOffsetMs: 'missing'}});
        fireEvent.click(screen.getByLabelText("Configurer le début de l'extrait"));
        const startInput = document.querySelector('input[name="startOffsetMs"]');
        fireEvent.change(startInput, {target: {value: '100'}});

        expect(setValue).toHaveBeenCalledWith(expect.objectContaining({startOffsetMs: '100'}));
        expect(setErrors).toHaveBeenCalledWith(expect.objectContaining({startOffsetMs: undefined}));
    });

    it('editing the end offset field from the popin updates the value and clears its error', () => {
        const {setValue, setErrors} = renderStep({endOffsetMs: '', errors: {endOffsetMs: 'missing'}});
        fireEvent.click(screen.getByLabelText("Configurer la fin de l'extrait"));
        const endInput = document.querySelector('input[name="endOffsetMs"]');
        fireEvent.change(endInput, {target: {value: '500'}});

        expect(setValue).toHaveBeenCalledWith(expect.objectContaining({endOffsetMs: '500'}));
        expect(setErrors).toHaveBeenCalledWith(expect.objectContaining({endOffsetMs: undefined}));
    });

    it('keeps the start offset error visible on the row while the popin is closed', () => {
        renderStep({errors: {startOffsetMs: 'invalide'}});
        expect(screen.getByText('invalide')).toBeTruthy();
        expect(screen.queryByRole('dialog')).toBeNull();
    });

    it('keeps the end offset error visible on the row while the popin is closed', () => {
        renderStep({errors: {endOffsetMs: 'invalide'}});
        expect(screen.getByText('invalide')).toBeTruthy();
        expect(screen.queryByRole('dialog')).toBeNull();
    });

    it('calls play() with a resolver producing start -> start+5s from the start popin', () => {
        mockPlay.mockClear();
        const {value} = renderStep({file: {name: 'clip.mp4'}, startOffsetMs: '2000'});
        fireEvent.click(screen.getByLabelText("Configurer le début de l'extrait"));
        fireEvent.click(screen.getByText('Tester'));

        expect(mockPlay).toHaveBeenCalledWith(value, expect.any(Function));
        const resolveWindow = mockPlay.mock.calls[0][1];

        expect(resolveWindow(10)).toEqual(previewWindow(value, 'start', 10));
        expect(resolveWindow(10)).toEqual({startSec: 2, endSec: 7});

        // clamps to duration when the 5s window would run past the end of the media
        expect(resolveWindow(5)).toEqual({startSec: 2, endSec: 5});
    });

    it('calls play() with a resolver producing end-5s -> end from the end popin', () => {
        mockPlay.mockClear();
        const {value} = renderStep({file: {name: 'clip.mp4'}, startOffsetMs: '0', endOffsetMs: '9000'});
        fireEvent.click(screen.getByLabelText("Configurer la fin de l'extrait"));
        fireEvent.click(screen.getByText('Tester'));

        expect(mockPlay).toHaveBeenCalledWith(value, expect.any(Function));
        const resolveWindow = mockPlay.mock.calls[0][1];

        expect(resolveWindow(999)).toEqual(previewWindow(value, 'end', 999));
        expect(resolveWindow(999)).toEqual({startSec: 4, endSec: 9});
    });

    it('falls back to the media duration from the end popin when no endOffsetMs is set', () => {
        mockPlay.mockClear();
        const {value} = renderStep({file: {name: 'clip.mp4'}, startOffsetMs: '0'});
        fireEvent.click(screen.getByLabelText("Configurer la fin de l'extrait"));
        fireEvent.click(screen.getByText('Tester'));

        const resolveWindow = mockPlay.mock.calls[0][1];
        expect(resolveWindow(12)).toEqual(previewWindow(value, 'end', 12));
        expect(resolveWindow(12)).toEqual({startSec: 7, endSec: 12});
    });

    it('shows the default fade-out recap of 1000 ms when fadeOutMs is not set', () => {
        renderStep();
        expect(screen.getByText('fondu sortant : 1000 ms')).toBeTruthy();
    });

    it('shows "sans fondu sortant" when fadeOutMs is 0', () => {
        renderStep({fadeOutMs: '0'});
        expect(screen.getByText('sans fondu sortant')).toBeTruthy();
    });

    it('shows a custom fade-out recap when fadeOutMs is set', () => {
        renderStep({fadeOutMs: '2000'});
        expect(screen.getByText('fondu sortant : 2000 ms')).toBeTruthy();
    });

    it('keeps the fadeOutMs error visible on the row while the popin is closed', () => {
        renderStep({errors: {fadeOutMs: 'invalide'}});
        expect(screen.getByText('invalide')).toBeTruthy();
        expect(screen.queryByRole('dialog')).toBeNull();
    });

    it('shows the default fade-in recap of 1000 ms when fadeInMs is not set', () => {
        renderStep();
        expect(screen.getByText('fondu entrant : 1000 ms')).toBeTruthy();
    });

    it('shows "sans fondu entrant" when fadeInMs is 0', () => {
        renderStep({fadeInMs: '0'});
        expect(screen.getByText('sans fondu entrant')).toBeTruthy();
    });

    it('shows a custom fade-in recap when fadeInMs is set', () => {
        renderStep({fadeInMs: '2000'});
        expect(screen.getByText('fondu entrant : 2000 ms')).toBeTruthy();
    });

    it('recaps both fades with distinct labels so the two rows cannot be confused', () => {
        renderStep({fadeInMs: '500', fadeOutMs: '1500'});
        expect(screen.getByText('fondu entrant : 500 ms')).toBeTruthy();
        expect(screen.getByText('fondu sortant : 1500 ms')).toBeTruthy();
    });

    it('keeps the fadeInMs error visible on the row while the popin is closed', () => {
        renderStep({errors: {fadeInMs: 'invalide'}});
        expect(screen.getByText('invalide')).toBeTruthy();
        expect(screen.queryByRole('dialog')).toBeNull();
    });
});
