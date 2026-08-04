import 'react';
import {useEffect, useRef} from 'react';

function ConfirmDialog({title, message, confirmLabel, cancelLabel, onConfirm, onCancel}) {
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
                <h3>{title}</h3>
                <p>{message}</p>
                <div className="confirm-dialog-actions">
                    <button type="button" className="btn" ref={cancelButtonRef} onClick={onCancel}>{cancelLabel}</button>
                    <button type="button" className="btn btn-accent" onClick={onConfirm}>{confirmLabel}</button>
                </div>
            </div>
        </div>
    );
}

export default ConfirmDialog;
