import { Fragment } from 'react'
import { useTranslation } from 'react-i18next';
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
        <div className='form-group'>
            <label htmlFor={`step-file-${value.id}`} className="form-label">{t('step.form.src.label')}</label>
            <div className="custom-file">
                <input
                    type="file"
                    style={{ display: 'none' }}
                    className={`custom-file-input${errors.file ? ' is-invalid' : ''}`}
                    id={`step-file-${value.id}`}
                    onChange={handleFile}
                />
                <label className="btn btn-light" htmlFor={`step-file-${value.id}`}>{getFilename(value, t('step.form.src.placeholder'))}</label>
                {errors.file && <div className="invalid-feedback">{errors.file}</div>}
            </div>
        </div>
    </Fragment>
}

export default ImageStep;
