import './SuccessPopup.css';
// comme
export default function SuccessPopup({
  open,
  title = 'Submitted successfully',
  message,
  referenceId,
  confirmLabel = 'Continue',
  onConfirm,
}) {
  if (!open) return null;

  return (
    <div className="success-popup-overlay" role="presentation">
      <div
        className="success-popup"
        role="dialog"
        aria-modal="true"
        aria-labelledby="success-popup-title"
      >
        <div className="success-popup-icon" aria-hidden="true">✓</div>
        <h2 id="success-popup-title">{title}</h2>
        {message && <p className="success-popup-message">{message}</p>}
        {referenceId && (
          <div className="success-popup-ref">
            <span className="success-popup-ref-label">Reference ID</span>
            <span className="success-popup-ref-value">{referenceId}</span>
          </div>
        )}
        <button type="button" className="btn btn-primary" onClick={onConfirm}>
          {confirmLabel}
        </button>
      </div>
    </div>
  );
}
