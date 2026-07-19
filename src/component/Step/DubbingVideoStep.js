import { Fragment } from 'react'
import { useTranslation } from 'react-i18next';
import { getFilename } from '../../lib/filename';

function DubbingVideoStep({ value, setValue }) {
    const { t } = useTranslation();

    function handleFile(e) {
        setValue({
            ...value,
            file: e.target.files[0]
        })
    }

    function handleChange(e) {
        setValue({
            ...value,
            [e.target.getAttribute('name')]: e.target.value
        })
    }

    return <Fragment>
        <div className='form-group'>
            <label htmlFor={`step-file-${value.id}`} className="form-label">{t('step.form.src.label')}</label>
            <div>
                <input
                    type="file"
                    style={{display: 'none'}}
                    id={`step-file-${value.id}`}
                    onChange={handleFile}
                />
                <label className="btn btn-light" htmlFor={`step-file-${value.id}`}>{getFilename(value, t('step.form.src.placeholder'))}</label>
            </div>
        </div>
        <div className='form-group'>
            <label htmlFor={`step-time-${value.id}`} className="form-label">{t('step.form.time')}</label>
            <input
                type="text"
                id={`step-time-${value.id}`}
                className="form-control"
                value={value.time}
                name='time'
                onChange={handleChange}
            />
        </div>
        <div className='form-group'>
            <label htmlFor={`step-description-${value.id}`}
                   className="form-label">{t('step.form.description')}</label>
            <textarea
                id={`step-description-${value.id}`}
                className="form-control"
                value={value.description}
                name='description'
                onChange={handleChange}
            />
        </div>
    </Fragment>
}

export default DubbingVideoStep;
