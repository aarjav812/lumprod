import { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../AuthContext';
import { db } from '../firebaseDb';
import { doc, updateDoc, serverTimestamp } from 'firebase/firestore';
import '../styles/Payment.css';

export default function Payment() {
  const navigate = useNavigate();
  const { state } = useLocation();
  const _auth = useAuth();
  const initialSubmission = state?.submission;
  
  const [submission] = useState(initialSubmission || null);
  const [transactionId, setTransactionId] = useState('');
  const [loading, setLoading] = useState(!initialSubmission);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);

  // If submission not passed via state, try to redirect back
  useEffect(() => {
    if (!initialSubmission) {
      setError('No submission data found. Redirecting to dashboard...');
      setTimeout(() => navigate('/dashboard'), 2000);
    }
  }, [initialSubmission, navigate]);

  if (!submission) {
    return (
      <div className="payment-page">
        <div className="container">
          <div className="error-state">
            <h2>No Submission Found</h2>
            <p>{error || 'Please go back and select a submission to make payment.'}</p>
            <button onClick={() => navigate('/dashboard')} className="btn btn-primary">
              Back to Dashboard
            </button>
          </div>
        </div>
      </div>
    );
  }

  if (loading) {
    return (
      <div className="payment-page">
        <div className="container">
          <div className="loading-container">
            <div className="loading-spinner"></div>
            <p>Loading payment details...</p>
          </div>
        </div>
      </div>
    );
  }

  const handlePaymentSubmit = async (e) => {
    e.preventDefault();
    
    if (!transactionId.trim()) {
      setError('Please enter a transaction ID');
      return;
    }

    setLoading(true);
    setError('');

    try {
      if (!submission.id) {
        throw new Error('Submission ID is missing. Please go back to dashboard and try again.');
      }

      // Update the submission document
      const submissionRef = doc(db, 'lumiere_submissions', submission.id);
      
      const updateData = {
        paymentStatus: 'confirmation-pending',
        transactionId: transactionId.trim(),
        paymentSubmittedAt: serverTimestamp()
      };
      
      // Only add transactionDetails if needed
      if (submission.submissionId && submission.directorEmail) {
        updateData.transactionDetails = {
          submissionId: submission.submissionId,
          directorEmail: submission.directorEmail,
          amount: submission.fee,
          transactionId: transactionId.trim()
        };
      }
      
      await updateDoc(submissionRef, updateData);
      setSuccess(true);
      setTimeout(() => {
        navigate('/dashboard', { 
          state: { message: 'Payment submitted successfully! Awaiting confirmation.' } 
        });
      }, 2000);
    } catch (err) {
      setError(`Error: ${err.message}`);
    } finally {
      setLoading(false);
    }
  };

  if (success) {
    return (
      <div className="payment-page">
        <div className="container">
          <div className="success-container">
            <div className="success-icon">Done</div>
            <h1>Payment Submitted!</h1>
            <p>Your payment has been submitted successfully.</p>
            <p>Your payment status is now: <strong>Confirmation Pending</strong></p>
            <p>Redirecting to dashboard...</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="payment-page">
      <div className="container">
        <div className="payment-container">
          <button onClick={() => navigate('/dashboard')} className="back-button">
            ← Back to Dashboard
          </button>

          <h1 className="payment-title">Complete Your Payment</h1>

          <div className="payment-content">
            {/* Left Section - Payment Details */}
            <div className="payment-details-section">
              <div className="payment-details-card">
                <h2>Payment Information</h2>

                <div className="detail-item">
                  <label>Film Title</label>
                  <p className="detail-value">{submission.title}</p>
                </div>

                <div className="detail-item">
                  <label>Category</label>
                  <p className="detail-value">{submission.categoryName}</p>
                </div>

                <div className="detail-item">
                  <label>Team Lead Email</label>
                  <p className="detail-value">{submission.directorEmail}</p>
                </div>

                <div className="detail-item">
                  <label>Submission ID</label>
                  <p className="detail-value">{submission.submissionId}</p>
                </div>

                <div className="detail-item amount-highlight">
                  <label>Amount to Pay</label>
                  <p className="detail-value amount">₹{submission.fee}</p>
                </div>
              </div>
            </div>

            {/* Right Section - QR Code & Transaction */}
            <div className="payment-qr-section">
              <div className="qr-card">
                <h2>Scan to Pay</h2>
                
                <div className="qr-code-placeholder">
                  <img 
                    src="/qr-code.png" 
                    alt="Payment QR Code" 
                    className="qr-code-image"
                  />
                </div>

                <p className="qr-instructions">
                  Scan this QR code using your UPI app to make the payment of <strong>₹{submission.fee}</strong>
                </p>

                {error && <div className="error-message">{error}</div>}

                <form onSubmit={handlePaymentSubmit} className="transaction-form">
                  <div className="form-group">
                    <label className="form-label">Transaction ID *</label>
                    <input
                      type="text"
                      className="form-input"
                      value={transactionId}
                      onChange={(e) => setTransactionId(e.target.value)}
                      placeholder="Enter your transaction ID (e.g., TXN12345678)"
                      required
                    />
                    <span className="form-hint">
                      You&apos;ll receive the transaction ID in your payment confirmation message
                    </span>
                  </div>

                  <button 
                    type="submit" 
                    className="btn btn-primary btn-large"
                    disabled={loading}
                  >
                    {loading ? 'Submitting...' : 'Submit Payment'}
                  </button>

                  <p className="payment-note">
                    After submitting, your payment status will be &quot;Confirmation Pending&quot;.
                    Our team will verify and confirm within 24 hours.
                  </p>
                </form>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
