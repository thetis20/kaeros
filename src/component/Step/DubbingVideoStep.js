import { Fragment } from 'react'
import { useTranslation } from 'react-i18next';
import { IconUpload } from '@tabler/icons-react';
import { getFilename, hasSource, resolveAutoFillName } from '../../lib/filename';
import useMediaPreview from '../Hook/useMediaPreview';

export function validate(value, t) {
    const errors = {};
    if (!hasSource(value)) errors.file = t('step.form.error.file');
    if (!value.time || !value.time.trim()) errors.time = t('step.form.error.time');
    if (value.startOffsetMs !== undefined && value.startOffsetMs !== null && value.startOffsetMs !== '' && (!Number.isInteger(Number(value.startOffsetMs)) || Number(value.startOffsetMs) < 0)) {
        errors.startOffsetMs = t('step.form.error.startOffset');
    }
    if (value.endOffsetMs !== undefined && value.endOffsetMs !== null && value.endOffsetMs !== '' && (!Number.isInteger(Number(value.endOffsetMs)) || Number(value.endOffsetMs) <= Number(value.startOffsetMs || 0))) {
        errors.endOffsetMs = t('step.form.error.endOffset');
    }
    return errors;
}

function DubbingVideoStep({ value, setValue, errors = {}, setErrors = () => {} }) {
    const { t } = useTranslation();
    const { mediaRef: previewRef, play } = useMediaPreview();

    function testPlayback() {
        play(value);
    }

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

        <div style={{display: 'flex', gap: 10, marginBottom: 10}}>
            <div>
                <label htmlFor={`step-start-offset-${value.id}`} className="field-label">{t('step.form.startOffset')}</label>
                <input
                    type="number"
                    min="0"
                    id={`step-start-offset-${value.id}`}
                    className={errors.startOffsetMs ? 'is-invalid' : ''}
                    value={value.startOffsetMs ?? ''}
                    name='startOffsetMs'
                    onChange={handleChange}
                />
                {errors.startOffsetMs && <div className="invalid-feedback">{errors.startOffsetMs}</div>}
            </div>
            <div>
                <label htmlFor={`step-end-offset-${value.id}`} className="field-label">{t('step.form.endOffset')}</label>
                <input
                    type="number"
                    min="0"
                    id={`step-end-offset-${value.id}`}
                    className={errors.endOffsetMs ? 'is-invalid' : ''}
                    value={value.endOffsetMs ?? ''}
                    name='endOffsetMs'
                    onChange={handleChange}
                />
                {errors.endOffsetMs && <div className="invalid-feedback">{errors.endOffsetMs}</div>}
            </div>
        </div>

        {hasSource(value) && (
            <div style={{marginBottom: 10}}>
                <video ref={previewRef} controls style={{width: 320, marginBottom: 8}}/>
                <div>
                    <button type="button" className="btn btn-sm" onClick={testPlayback}>{t('step.form.test')}</button>
                </div>
            </div>
        )}

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
