import '../../../lib/i18n';
import {render, screen, fireEvent} from '@testing-library/react';
import BattleRoyalStep, {validate} from '../BattleRoyalStep';

describe('BattleRoyalStep validate()', () => {
    it('requires at least one player name', () => {
        expect(validate({}, (key) => key).players).toBe('step.form.error.players');
        expect(validate({players: ''}, (key) => key).players).toBe('step.form.error.players');
        expect(validate({players: ' ; ; '}, (key) => key).players).toBe('step.form.error.players');
    });

    it('accepts a semicolon-separated list of names', () => {
        expect(validate({players: 'Alice; Bob ;Charlie'}, (key) => key)).toEqual({});
    });
});

describe('BattleRoyalStep component', () => {
    function renderStep(overrides = {}) {
        const value = {id: 'step-1', ...overrides};
        const setValue = jest.fn();
        const setErrors = jest.fn();
        render(<BattleRoyalStep value={value} setValue={setValue} errors={overrides.errors || {}} setErrors={setErrors}/>);
        return {value, setValue, setErrors};
    }

    it('shows the help text for the players field', () => {
        renderStep();
        expect(screen.getByText('Séparer les jouers par un ;')).toBeTruthy();
    });

    it('editing players updates the value and clears the players error', () => {
        const {setValue, setErrors} = renderStep({players: '', errors: {players: 'missing'}});
        fireEvent.change(screen.getByLabelText('Joueurs'), {target: {value: 'Alice; Bob'}});

        expect(setValue).toHaveBeenCalledWith(expect.objectContaining({players: 'Alice; Bob'}));
        expect(setErrors).toHaveBeenCalledWith(expect.objectContaining({players: undefined}));
    });

    it('does not touch errors when there is nothing to clear', () => {
        const {setErrors} = renderStep({players: ''});
        fireEvent.change(screen.getByLabelText('Joueurs'), {target: {value: 'Alice'}});
        expect(setErrors).not.toHaveBeenCalled();
    });
});
