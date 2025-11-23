import { Fragment } from 'react'
import { useTranslation } from 'react-i18next';

function TimeStep({ value, setValue }) {
    const { t } = useTranslation();

    function handleChange(e) {
        setValue({
            ...value,
            [e.target.getAttribute('name')]: e.target.value
        })
    }

    return <Fragment>
        <div className='form-group'>
            <label htmlFor={`step-impro-${value.id}`} className="form-label">{t('step.form.impro')}</label>
            <input
                type="number"
                min="1"
                id={`step-impro-${value.id}`}
                className="form-control"
                value={value.impro}
                name='impro'
                onChange={handleChange}
            />
        </div>
        <div className='form-group'>
            <label htmlFor={`step-minutes-${value.id}`}
                   className="form-label">{t('step.form.minutes')}</label>
            <input
                type="number"
                min="1"
                id={`step-minutes-${value.id}`}
                className="form-control"
                value={value.minutes}
                name='minutes'
                onChange={handleChange}
            />
        </div>
    </Fragment>
}

export default TimeStep;
