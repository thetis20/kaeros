import { Fragment } from 'react'
import { useTranslation } from 'react-i18next';
import { getFilename } from '../../lib/filename';

function ImageStep({ value, setValue }) {
    const { t } = useTranslation();

    function handleFile(e) {
        setValue({
            ...value,
            file: e.target.files[0]
        })
    }

    return <Fragment>
        <div className='form-group'>
            <label htmlFor={`step-file-${value.id}`} className="form-label">{t('step.form.src.label')}</label>
            <div className="custom-file">
                <input
                    type="file"
                    style={{ display: 'none' }}
                    className="custom-file-input"
                    id={`step-file-${value.id}`}
                    onChange={handleFile}
                />
                <label className="btn btn-light" htmlFor={`step-file-${value.id}`}>{getFilename(value, t('step.form.src.placeholder'))}</label>
            </div>
        </div>
    </Fragment>
}

export default ImageStep;
