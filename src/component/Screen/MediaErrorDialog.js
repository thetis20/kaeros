import 'react';
import {useEffect, useRef} from 'react';
import {useTranslation} from 'react-i18next';
import {messageKeyFor} from '../../lib/mediaCheck';

function MediaErrorDialog({issues, onClose}) {
    const {t} = useTranslation();
    const closeButtonRef = useRef(null);

    useEffect(() => {
        closeButtonRef.current?.focus();
    }, []);

    function handleKeyDown(event) {
        event.stopPropagation();
        if (event.key === 'Escape') {
            onClose();
        }
    }

    const steps = issues.filter((issue) => issue.kind === 'step');
    const audios = issues.filter((issue) => issue.kind === 'audio');

    function renderGroup(titleKey, entries) {
        if (entries.length === 0) return null;
        return (
            <div style={{marginBottom: 12}}>
                <p style={{fontWeight: 500, margin: '0 0 4px', color: 'var(--text-primary)'}}>{t(titleKey)}</p>
                <ul style={{margin: 0, paddingLeft: 18}}>
                    {entries.map((entry) => (
                        <li key={entry.id} style={{color: 'var(--text-secondary)'}}>
                            {entry.name} — {t(messageKeyFor(entry.code), {path: entry.src, name: entry.name})}
                        </li>
                    ))}
                </ul>
            </div>
        );
    }

    return (
        <div className="confirm-dialog-overlay" onClick={onClose} onKeyDown={handleKeyDown}>
            <div className="confirm-dialog-box" role="dialog" aria-modal="true" onClick={(e) => e.stopPropagation()}>
                <h3>{t('mediaCheck.dialog.title')}</h3>
                <p>{t('mediaCheck.dialog.message')}</p>
                {renderGroup('mediaCheck.dialog.steps', steps)}
                {renderGroup('mediaCheck.dialog.audios', audios)}
                <div className="confirm-dialog-actions">
                    <button type="button" className="btn btn-accent" ref={closeButtonRef} onClick={onClose}>
                        {t('mediaCheck.dialog.close')}
                    </button>
                </div>
            </div>
        </div>
    );
}

export default MediaErrorDialog;
