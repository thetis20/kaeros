import { Fragment } from 'react'
import { useTranslation } from 'react-i18next';
import { getFilename, hasSource } from '../../lib/filename';

export function validate(value, t) {
    const errors = {};
    if (!hasSource(value)) errors.file = t('step.form.error.file');
    if (!value.time || !value.time.trim()) errors.time = t('step.form.error.time');
    return errors;
}

function DubbingVideoStep({ value, setValue, errors = {}, setErrors = () => {} }) {
    const { t } = useTranslation();

    function handleFile(e) {
        setValue({
            ...value,
            file: e.target.files[0]
        })
        if (errors.file) setErrors({...errors, file: undefined})
    }

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
            <label htmlFor={`step-file-${value.id}`} className="form-label">{t('step.form.src.label')}</label>
            <div>
                <input
                    type="file"
                    style={{display: 'none'}}
                    className={errors.file ? 'is-invalid' : undefined}
                    id={`step-file-${value.id}`}
                    onChange={handleFile}
                />
                <label className="btn btn-light" htmlFor={`step-file-${value.id}`}>{getFilename(value, t('step.form.src.placeholder'))}</label>
                {errors.file && <div className="invalid-feedback">{errors.file}</div>}
            </div>
        </div>
        <div className='form-group'>
            <label htmlFor={`step-time-${value.id}`} className="form-label">{t('step.form.time')}</label>
            <input
                type="text"
                id={`step-time-${value.id}`}
                className={`form-control ${errors.time ? 'is-invalid' : ''}`}
                value={value.time ?? ''}
                name='time'
                onChange={handleChange}
            />
            {errors.time && <div className="invalid-feedback">{errors.time}</div>}
        </div>
        <div className='form-group'>
            <label htmlFor={`step-description-${value.id}`}
                   className="form-label">{t('step.form.description')}</label>
            <textarea
                id={`step-description-${value.id}`}
                className="form-control"
                value={value.description ?? ''}
                name='description'
                onChange={handleChange}
            />
        </div>
    </Fragment>
}

export default DubbingVideoStep;
