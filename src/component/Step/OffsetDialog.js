import 'react';
import { useEffect, useRef, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { previewWindow, fadeWindow, fadeOpacity, fadeInWindow, fadeInOpacity } from '../../lib/mediaWindow';
import useMediaPreview from '../Hook/useMediaPreview';
import BlackFadeOverlay from '../Media/BlackFadeOverlay';

function OffsetDialog({ anchor, value, onChange, error, fadeError, onClose }) {
    const { t } = useTranslation();
    const { mediaRef: previewRef, play } = useMediaPreview();
    const inputRef = useRef(null);
    const fieldName = anchor === 'start' ? 'startOffsetMs' : 'endOffsetMs';
    const fieldLabel = t(anchor === 'start' ? 'step.form.startOffset' : 'step.form.endOffset');
    const fieldValue = value[fieldName] ?? '';
    const fadeFieldName = anchor === 'start' ? 'fadeInMs' : 'fadeOutMs';
    const fadeLabel = t(anchor === 'start' ? 'step.form.fadeIn' : 'step.form.fadeOut');
    const fadeValue = value[fadeFieldName] ?? 1000;
    // a fade in opens on black, so the preview must too -- otherwise the first
    // frame flashes bright before the first timeupdate lands.
    const opensOnBlack = anchor === 'start' && (Number(fadeValue) || 0) > 0;
    const [duration, setDuration] = useState(null);
    const [previewOpacity, setPreviewOpacity] = useState(0);

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
        setPreviewOpacity(opensOnBlack ? 1 : 0);
        play(value, (d) => previewWindow(value, anchor, d));
    }

    function handleLoadedMetadata(e) {
        setDuration(e.target.duration);
        setPreviewOpacity(opensOnBlack ? 1 : 0);
    }

    function handleTimeUpdate(e) {
        const previewWin = previewWindow(value, anchor, duration);
        if (anchor === 'start') {
            const fade = fadeInWindow(previewWin.startSec, previewWin.endSec, duration, fadeValue);
            setPreviewOpacity(fadeInOpacity(e.target.currentTime, fade));
            return;
        }
        const fade = fadeWindow(previewWin.startSec, previewWin.endSec, duration, fadeValue);
        setPreviewOpacity(fadeOpacity(e.target.currentTime, fade));
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

                <div>
                    <span className="field-label">{fadeLabel}</span>
                    <input
                        type="number"
                        min="0"
                        aria-label={fadeLabel}
                        className={fadeError ? 'is-invalid' : ''}
                        value={fadeValue}
                        name={fadeFieldName}
                        onChange={onChange}
                    />
                    {fadeError && <div className="invalid-feedback">{fadeError}</div>}
                </div>

                <div style={{marginTop: 10, marginBottom: 10}}>
                    <button type="button" className="btn btn-sm" onClick={testPlayback}>{t('step.form.test')}</button>
                </div>

                <div style={{marginBottom: 10, position: 'relative', width: 320}}>
                    <video
                        ref={previewRef}
                        style={{width: 320}}
                        onLoadedMetadata={handleLoadedMetadata}
                        onTimeUpdate={handleTimeUpdate}
                    />
                    <BlackFadeOverlay opacity={previewOpacity}/>
                </div>

                <div className="confirm-dialog-actions">
                    <button type="button" className="btn" onClick={onClose}>{t('step.form.close')}</button>
                </div>
            </div>
        </div>
    );
}

export default OffsetDialog;
