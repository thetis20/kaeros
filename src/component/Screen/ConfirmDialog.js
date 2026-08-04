import 'react';

function ConfirmDialog({title, message, confirmLabel, cancelLabel, onConfirm, onCancel}) {
    return (
        <div className="confirm-dialog-overlay">
            <div className="confirm-dialog-box" role="dialog" aria-modal="true">
                <h3>{title}</h3>
                <p>{message}</p>
                <div className="confirm-dialog-actions">
                    <button type="button" className="btn" onClick={onCancel}>{cancelLabel}</button>
                    <button type="button" className="btn btn-accent" onClick={onConfirm}>{confirmLabel}</button>
                </div>
            </div>
        </div>
    );
}

export default ConfirmDialog;
