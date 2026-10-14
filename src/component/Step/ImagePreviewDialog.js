import 'react';
import { useEffect, useRef, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { toFileUrl } from '../../lib/mediaUrl';
import { ImageStage } from '../Session/ImageTrack';

function ImagePreviewDialog({ value, onChange, onClose }) {
    const { t } = useTranslation();
    const inputRef = useRef(null);
    const [blobUrl, setBlobUrl] = useState(null);
    const scale = value.scale ?? 100;
    const url = value.file ? blobUrl : toFileUrl(value.src);

    useEffect(() => {
        inputRef.current?.focus();
    }, []);

    useEffect(() => {
        if (!value.file) {
            setBlobUrl(null);
            return undefined;
        }
        const created = URL.createObjectURL(value.file);
        setBlobUrl(created);
        return () => URL.revokeObjectURL(created);
    }, [value.file]);

    function handleKeyDown(event) {
        event.stopPropagation();
        if (event.key === 'Escape') {
            onClose();
        }
    }

    return (
        <div className="confirm-dialog-overlay" onClick={onClose} onKeyDown={handleKeyDown}>
            <div
                className="confirm-dialog-box"
                role="dialog"
                aria-modal="true"
                style={{maxWidth: 'none'}}
                onClick={(e) => e.stopPropagation()}>
                <h3>{value.name}</h3>

                <div style={{width: 'min(80vw, 142vh)', aspectRatio: '16 / 9', marginBottom: 10}}>
                    <ImageStage url={url} scale={scale} alt={value.name} width="100%" height="100%"/>
                </div>

                <div className="file-row">
                    <input
                        type="range"
                        min="0"
                        max="100"
                        step="1"
                        ref={inputRef}
                        aria-label={t('step.form.scale.label')}
                        value={scale}
                        onChange={e => onChange(Number(e.target.value))}
                    />
                    <span>{t('step.form.scale.value', {percent: scale})}</span>
                </div>

                <div className="confirm-dialog-actions">
                    <button type="button" className="btn" onClick={onClose}>{t('step.form.close')}</button>
                </div>
            </div>
        </div>
    );
}

export default ImagePreviewDialog;
