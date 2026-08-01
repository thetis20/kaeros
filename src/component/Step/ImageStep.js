import { Fragment } from 'react'
import { useTranslation } from 'react-i18next';
import { IconUpload } from '@tabler/icons-react';
import { getFilename, hasSource } from '../../lib/filename';

export function validate(value, t) {
    const errors = {};
    if (!hasSource(value)) errors.file = t('step.form.error.file');
    return errors;
}

function ImageStep({ value, setValue, errors = {}, setErrors = () => {} }) {
    const { t } = useTranslation();

    function handleFile(e) {
        setValue({
            ...value,
            file: e.target.files[0]
        })
        if (errors.file) setErrors({...errors, file: undefined})
    }

    return <Fragment>
        <label htmlFor={`step-file-${value.id}`} className="field-label">{t('step.form.src.label')}</label>
        <div className="file-row">
            <div className="file-thumb"><IconUpload size={18}/></div>
            <input
                type="file"
                style={{ display: 'none' }}
                className={errors.file ? 'is-invalid' : undefined}
                id={`step-file-${value.id}`}
                onChange={handleFile}
            />
            <label className="btn btn-sm" htmlFor={`step-file-${value.id}`}>{getFilename(value, t('step.form.src.placeholder'))}</label>
        </div>
        {errors.file && <div className="invalid-feedback">{errors.file}</div>}
    </Fragment>
}

export default ImageStep;
