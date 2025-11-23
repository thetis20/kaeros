import { Fragment } from 'react'
import { useTranslation } from 'react-i18next';

function BattleRoyalStep({ value, setValue }) {
    const { t } = useTranslation();

    function handleChange(e) {
        setValue({
            ...value,
            [e.target.getAttribute('name')]: e.target.value
        })
    }

    return <Fragment>
        <div className='form-group'>
            <label htmlFor={`step-players-${value.id}`} className="form-label">{t('step.form.players.label')}</label>
            <input
                type="text"
                id={`step-players-${value.id}`}
                className="form-control"
                value={value.players}
                name='players'
                onChange={handleChange}
            />
            <small id={`step-players-${value.id}-help`} className="form-text text-muted">
                {t('step.form.players.help')}
            </small>
        </div>
    </Fragment>
}

export default BattleRoyalStep;
