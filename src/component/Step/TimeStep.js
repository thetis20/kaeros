import { Fragment } from 'react'
import { useTranslation } from 'react-i18next';

export function validate(value, t) {
    const errors = {};
    ['impro', 'minutes'].forEach((field) => {
        const n = Number(value[field]);
        if (value[field] === '' || value[field] === undefined || !Number.isInteger(n) || n < 1) {
            errors[field] = t('step.form.error.' + field);
        }
    });
    return errors;
}

function TimeStep({ value, setValue, errors = {}, setErrors = () => {} }) {
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
            <label htmlFor={`step-impro-${value.id}`} className="form-label">{t('step.form.impro')}</label>
            <input
                type="number"
                min="1"
                id={`step-impro-${value.id}`}
                className={`form-control ${errors.impro ? 'is-invalid' : ''}`}
                value={value.impro ?? ''}
                name='impro'
                onChange={handleChange}
            />
            {errors.impro && <div className="invalid-feedback">{errors.impro}</div>}
        </div>
        <div className='form-group'>
            <label htmlFor={`step-minutes-${value.id}`}
                   className="form-label">{t('step.form.minutes')}</label>
            <input
                type="number"
                min="1"
                id={`step-minutes-${value.id}`}
                className={`form-control ${errors.minutes ? 'is-invalid' : ''}`}
                value={value.minutes ?? ''}
                name='minutes'
                onChange={handleChange}
            />
            {errors.minutes && <div className="invalid-feedback">{errors.minutes}</div>}
        </div>
    </Fragment>
}

export default TimeStep;
