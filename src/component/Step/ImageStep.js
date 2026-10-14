import { Fragment, useState } from 'react'
import { useTranslation } from 'react-i18next';
import { IconUpload } from '@tabler/icons-react';
import { getFilename, hasSource, resolveAutoFillName } from '../../lib/filename';
import ImagePreviewDialog from './ImagePreviewDialog';

export function validate(value, t) {
    const errors = {};
    if (!hasSource(value)) errors.file = t('step.form.error.file');
    return errors;
}

function ImageStep({ value, setValue, errors = {}, setErrors = () => {} }) {
    const { t } = useTranslation();
    const [preview, setPreview] = useState(false);

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
        <label htmlFor={`step-scale-${value.id}`} className="field-label">{t('step.form.scale.label')}</label>
        <div className="file-row">
            <input
                type="range"
                id={`step-scale-${value.id}`}
                min="0"
                max="100"
                step="1"
                value={value.scale ?? 100}
                onChange={e => setValue({...value, scale: Number(e.target.value)})}
            />
            <span>{t('step.form.scale.value', {percent: value.scale ?? 100})}</span>
            <button type="button" className="btn btn-sm" disabled={!hasSource(value)} onClick={() => setPreview(true)}>{t('step.form.test')}</button>
        </div>
        {preview && <ImagePreviewDialog
            value={value}
            onChange={scale => setValue({...value, scale})}
            onClose={() => setPreview(false)}
        />}
    </Fragment>
}

export default ImageStep;
