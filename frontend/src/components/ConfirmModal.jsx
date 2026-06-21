function ConfirmModal({ open, title, message, confirmLabel = "Delete", cancelLabel = "Cancel", onConfirm, onCancel }) {
    if (!open) {
        return null;
    }

    return (
        <div className="modal-backdrop" role="presentation" onClick={onCancel}>
            <div className="modal-card" role="dialog" aria-modal="true" onClick={(event) => event.stopPropagation()}>
                <div className="modal-header">
                    <h3>{title}</h3>
                </div>
                <p className="modal-message">{message}</p>
                <div className="row-actions modal-actions">
                    <button className="button button-secondary" type="button" onClick={onCancel}>
                        {cancelLabel}
                    </button>
                    <button className="button button-danger" type="button" onClick={onConfirm}>
                        {confirmLabel}
                    </button>
                </div>
            </div>
        </div>
    );
}

export default ConfirmModal;
