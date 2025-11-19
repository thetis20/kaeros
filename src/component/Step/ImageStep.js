import { Fragment } from 'react'
import { useTranslation } from 'react-i18next';

function ImageStep({ value, setValue }) {
    const { t } = useTranslation();

    function getFilename() {
        if (value.file) {
            return value.file?.name
        }
        if (value.src) {
            const regex = /\/([^/]*\..*)/g;

            const array = [...value.src.matchAll(regex)];

            return array[0][1]
        }
        return t('step.form.src.placeholder')
    }

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
                <label className="btn btn-light" htmlFor={`step-file-${value.id}`}>{getFilename(value)}</label>
            </div>
        </div>
    </Fragment>
}

export default ImageStep;
