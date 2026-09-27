import { Fragment, useState } from 'react'
import { useTranslation } from 'react-i18next';
import { IconUpload, IconSettings } from '@tabler/icons-react';
import { getFilename, hasSource, resolveAutoFillName } from '../../lib/filename';
import OffsetDialog from './OffsetDialog';

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
    if (value.fadeOutMs !== undefined && value.fadeOutMs !== null && value.fadeOutMs !== '' && (!Number.isInteger(Number(value.fadeOutMs)) || Number(value.fadeOutMs) < 0)) {
        errors.fadeOutMs = t('step.form.error.fadeOut');
    }
    if (value.fadeInMs !== undefined && value.fadeInMs !== null && value.fadeInMs !== '' && (!Number.isInteger(Number(value.fadeInMs)) || Number(value.fadeInMs) < 0)) {
        errors.fadeInMs = t('step.form.error.fadeIn');
    }
    return errors;
}

function DubbingVideoStep({ value, setValue, errors = {}, setErrors = () => {} }) {
    const { t } = useTranslation();
    const [dialog, setDialog] = useState(null);

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

        <div className="file-row">
            <span>{t('step.form.startOffsetValue', {ms: value.startOffsetMs || 0})}</span>
            <span>{Number(value.fadeInMs ?? 1000) > 0 ? t('step.form.fadeInValue', {ms: value.fadeInMs ?? 1000}) : t('step.form.fadeInNone')}</span>
            <button
                type="button"
                className="btn btn-icon"
                aria-label={t('step.form.configureStart')}
                onClick={() => setDialog('start')}
            ><IconSettings/></button>
        </div>
        {errors.startOffsetMs && <div className="invalid-feedback">{errors.startOffsetMs}</div>}
        {errors.fadeInMs && <div className="invalid-feedback">{errors.fadeInMs}</div>}

        <div className="file-row">
            <span>{value.endOffsetMs ? t('step.form.endOffsetValue', {ms: value.endOffsetMs}) : t('step.form.endOffsetNone')}</span>
            <span>{Number(value.fadeOutMs ?? 1000) > 0 ? t('step.form.fadeOutValue', {ms: value.fadeOutMs ?? 1000}) : t('step.form.fadeOutNone')}</span>
            <button
                type="button"
                className="btn btn-icon"
                aria-label={t('step.form.configureEnd')}
                onClick={() => setDialog('end')}
            ><IconSettings/></button>
        </div>
        {errors.endOffsetMs && <div className="invalid-feedback">{errors.endOffsetMs}</div>}
        {errors.fadeOutMs && <div className="invalid-feedback">{errors.fadeOutMs}</div>}

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

        {dialog && (
            <OffsetDialog
                anchor={dialog}
                value={value}
                onChange={handleChange}
                error={dialog === 'start' ? errors.startOffsetMs : errors.endOffsetMs}
                fadeError={dialog === 'start' ? errors.fadeInMs : errors.fadeOutMs}
                onClose={() => setDialog(null)}
            />
        )}
    </Fragment>
}

export default DubbingVideoStep;
