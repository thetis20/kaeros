import 'react';
import {useEffect, useRef} from 'react';
import {useTranslation} from 'react-i18next';

function UnsavedChangesDialog({onSave, onDiscard, onCancel}) {
    const {t} = useTranslation();
    const cancelButtonRef = useRef(null);

    useEffect(() => {
        cancelButtonRef.current?.focus();
    }, []);

    function handleKeyDown(event) {
        event.stopPropagation();
        if (event.key === 'Escape') {
            onCancel();
        }
    }

    return (
        <div className="confirm-dialog-overlay" onClick={onCancel} onKeyDown={handleKeyDown}>
            <div className="confirm-dialog-box" role="dialog" aria-modal="true" onClick={(e) => e.stopPropagation()}>
                <h3>{t('unsavedChanges.title')}</h3>
                <p>{t('unsavedChanges.message')}</p>
                <div className="confirm-dialog-actions">
                    <button type="button" className="btn" ref={cancelButtonRef} onClick={onCancel}>{t('unsavedChanges.cancel')}</button>
                    <button type="button" className="btn" onClick={onDiscard}>{t('unsavedChanges.discard')}</button>
                    <button type="button" className="btn btn-accent" onClick={onSave}>{t('unsavedChanges.save')}</button>
                </div>
            </div>
        </div>
    );
}

export default UnsavedChangesDialog;
