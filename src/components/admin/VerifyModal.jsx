import { useState } from 'react';
import PropTypes from 'prop-types';
import './VerifyModal.css';

export default function VerifyModal({ registration, onVerify, onReject, onClose }) {
  const [action, setAction] = useState('');  // 'verify' or 'reject'
  const [rejectionReason, setRejectionReason] = useState('');
  const [loading, setLoading] = useState(false);

  const handleConfirm = async () => {
    if (action === 'reject' && !rejectionReason.trim()) {
      alert('Please provide a rejection reason');
      return;
    }

    setLoading(true);
    try {
      if (action === 'verify') {
        await onVerify(registration.id);
      } else if (action === 'reject') {
        await onReject(registration.id, rejectionReason);
      }
      onClose();
    } catch (error) {
      alert(error.message || 'Action failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-content" onClick={(e) => e.stopPropagation()}>
        <button className="modal-close" onClick={onClose}>×</button>
        
        <h2>Review Registration</h2>
        
        <div className="registration-details">
          <div className="detail-row">
            <strong>Registration ID:</strong>
            <span>{registration.registrationId}</span>
          </div>
          <div className="detail-row">
            <strong>User:</strong>
            <span>{registration.userName || registration.userEmail}</span>
          </div>
          <div className="detail-row">
            <strong>Event:</strong>
            <span>{registration.eventName}</span>
          </div>
          <div className="detail-row">
            <strong>Total Fees:</strong>
            <span>₹{registration.totalFees}</span>
          </div>
          {registration.discount > 0 && (
            <div className="detail-row">
              <strong>Discount:</strong>
              <span>₹{registration.discount} ({registration.discountCode})</span>
            </div>
          )}
          {registration.accommodationRequired && (
            <div className="detail-row">
              <strong>Accommodation:</strong>
              <span>{registration.accommodationMembers} members (₹{registration.accommodationFees})</span>
            </div>
          )}
          {registration.paymentReceiptUrl && (
            <div className="detail-row">
              <strong>Receipt:</strong>
              <a href={registration.paymentReceiptUrl} target="_blank" rel="noopener noreferrer" className="receipt-link">
                View Receipt →
              </a>
            </div>
          )}
        </div>

        {!action && (
          <div className="modal-actions">
            <button 
              onClick={() => setAction('verify')} 
              className="btn-verify"
            >
              Verify
            </button>
            <button 
              onClick={() => setAction('reject')} 
              className="btn-reject"
            >
              Reject
            </button>
          </div>
        )}

        {action === 'reject' && (
          <div className="rejection-form">
            <label>
              <strong>Rejection Reason:</strong>
              <textarea
                value={rejectionReason}
                onChange={(e) => setRejectionReason(e.target.value)}
                placeholder="Enter reason for rejection..."
                rows={4}
              />
            </label>
            <div className="modal-actions">
              <button 
                onClick={handleConfirm} 
                disabled={loading}
                className="btn-confirm"
              >
                {loading ? 'Processing...' : 'Confirm Rejection'}
              </button>
              <button 
                onClick={() => setAction('')} 
                className="btn-cancel"
              >
                Cancel
              </button>
            </div>
          </div>
        )}

        {action === 'verify' && (
          <div className="confirmation-form">
            <p>Are you sure you want to verify this registration?</p>
            <div className="modal-actions">
              <button 
                onClick={handleConfirm} 
                disabled={loading}
                className="btn-confirm"
              >
                {loading ? 'Processing...' : 'Confirm Verification'}
              </button>
              <button 
                onClick={() => setAction('')} 
                className="btn-cancel"
              >
                Cancel
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

VerifyModal.propTypes = {
  registration: PropTypes.object.isRequired,
  onVerify: PropTypes.func.isRequired,
  onReject: PropTypes.func.isRequired,
  onClose: PropTypes.func.isRequired
};
