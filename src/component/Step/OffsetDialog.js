import 'react';
import { useEffect, useRef } from 'react';
import { useTranslation } from 'react-i18next';
import { previewWindow } from '../../lib/mediaWindow';
import useMediaPreview from '../Hook/useMediaPreview';

function OffsetDialog({ anchor, value, onChange, error, onClose }) {
    const { t } = useTranslation();
    const { mediaRef: previewRef, play } = useMediaPreview();
    const inputRef = useRef(null);
    const fieldName = anchor === 'start' ? 'startOffsetMs' : 'endOffsetMs';
    const fieldLabel = t(anchor === 'start' ? 'step.form.startOffset' : 'step.form.endOffset');
    const fieldValue = value[fieldName] ?? '';

    useEffect(() => {
        inputRef.current?.focus();
    }, []);

    function handleKeyDown(event) {
        event.stopPropagation();
        if (event.key === 'Escape') {
            onClose();
        }
    }

    function testPlayback() {
        play(value, (duration) => previewWindow(value, anchor, duration));
    }

    return (
        <div className="confirm-dialog-overlay" onClick={onClose} onKeyDown={handleKeyDown}>
            <div className="confirm-dialog-box" role="dialog" aria-modal="true" onClick={(e) => e.stopPropagation()}>
                <h3>{fieldLabel}</h3>

                <input
                    type="number"
                    min="0"
                    ref={inputRef}
                    aria-label={fieldLabel}
                    className={error ? 'is-invalid' : ''}
                    value={fieldValue}
                    name={fieldName}
                    onChange={onChange}
                />
                {error && <div className="invalid-feedback">{error}</div>}

                <div style={{marginTop: 10, marginBottom: 10}}>
                    <button type="button" className="btn btn-sm" onClick={testPlayback}>{t('step.form.test')}</button>
                </div>

                <div style={{marginBottom: 10}}>
                    <video ref={previewRef} style={{width: 320}}/>
                </div>

                <div className="confirm-dialog-actions">
                    <button type="button" className="btn" onClick={onClose}>{t('step.form.close')}</button>
                </div>
            </div>
        </div>
    );
}

export default OffsetDialog;
