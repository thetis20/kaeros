import { Fragment } from 'react'
import { useTranslation } from 'react-i18next';
import { IconUpload } from '@tabler/icons-react';
import { getFilename, hasSource, resolveAutoFillName } from '../../lib/filename';

export function validate(value, t) {
    const errors = {};
    if (!hasSource(value)) errors.file = t('step.form.error.file');
    if (!value.time || !value.time.trim()) errors.time = t('step.form.error.time');
    return errors;
}

function DubbingVideoStep({ value, setValue, errors = {}, setErrors = () => {} }) {
    const { t } = useTranslation();

    function handleFile(e) {
        const file = e.target.files[0];
        if (!file) return;
        const defaultName = t(`sessionCreation.newStepName.${value.type}`);
        const name = resolveAutoFillName(value.name, defaultName, file.name);
        setValue({
            ...value,
            file,
            name
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
        <label htmlFor={`step-file-${value.id}`} className="field-label">{t('step.form.src.label')}</label>
        <div className="file-row">
            <div className="file-thumb"><IconUpload size={18}/></div>
            <input
                type="file"
                style={{display: 'none'}}
                className={errors.file ? 'is-invalid' : undefined}
                id={`step-file-${value.id}`}
                onChange={handleFile}
            />
            <label className="btn btn-sm" htmlFor={`step-file-${value.id}`}>{getFilename(value, t('step.form.src.placeholder'))}</label>
        </div>
        {errors.file && <div className="invalid-feedback">{errors.file}</div>}

        <label htmlFor={`step-time-${value.id}`} className="field-label">{t('step.form.time')}</label>
        <input
            type="text"
            id={`step-time-${value.id}`}
            style={{width: 120, marginBottom: 10}}
            className={errors.time ? 'is-invalid' : ''}
            value={value.time ?? ''}
            name='time'
            onChange={handleChange}
        />
        {errors.time && <div className="invalid-feedback">{errors.time}</div>}

        <label htmlFor={`step-description-${value.id}`} className="field-label">{t('step.form.description')}</label>
        <textarea
            id={`step-description-${value.id}`}
            style={{width: '100%'}}
            value={value.description ?? ''}
            name='description'
            onChange={handleChange}
        />
    </Fragment>
}

export default DubbingVideoStep;
