import { Fragment } from 'react'
import { useTranslation } from 'react-i18next';

export function validate(value, t) {
    const errors = {};
    const names = (value.players || '').split(';').map(x => x.trim()).filter(Boolean);
    if (names.length === 0) errors.players = t('step.form.error.players');
    return errors;
}

function BattleRoyalStep({ value, setValue, errors = {}, setErrors = () => {} }) {
    const { t } = useTranslation();

    function handleChange(e) {
        const name = e.target.getAttribute('name');
        setValue({
            ...value,
            [name]: e.target.value
        })
        if (errors[name]) setErrors({...errors, [name]: undefined})
    }

    return <Fragment>
        <div className='form-group'>
            <label htmlFor={`step-players-${value.id}`} className="form-label">{t('step.form.players.label')}</label>
            <input
                type="text"
                id={`step-players-${value.id}`}
                className={`form-control ${errors.players ? 'is-invalid' : ''}`}
                value={value.players ?? ''}
                name='players'
                onChange={handleChange}
            />
            {errors.players && <div className="invalid-feedback">{errors.players}</div>}
            <small id={`step-players-${value.id}-help`} className="form-text text-muted">
                {t('step.form.players.help')}
            </small>
        </div>
    </Fragment>
}

export default BattleRoyalStep;
