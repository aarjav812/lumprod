import { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../AuthContext';
import { db } from '../firebaseDb';
import { collection, query, where, getDocs } from 'firebase/firestore';
import { Film } from 'lucide-react';
import './Dashboard.css';

export default function Dashboard() {
  const [submissions, setSubmissions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [successMessage, setSuccessMessage] = useState('');
  const [loggingOut, setLoggingOut] = useState(false);
  const { user, signOut } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  useEffect(() => {
    if (user) {
      fetchSubmissions();
    }
    
    // Show success message if returning from payment page
    if (location.state?.message) {
      setSuccessMessage(location.state.message);
      setTimeout(() => setSuccessMessage(''), 5000);
      window.history.replaceState({}, document.title);
    }
  }, [user, location]);

  const fetchSubmissions = async () => {
    try {
      const q = query(
        collection(db, 'lumiere_submissions'),
        where('userId', '==', user.uid)
      );
      
      const snapshot = await getDocs(q);
      const subs = [];
      snapshot.forEach((doc) => {
        const data = doc.data();
        subs.push({
          id: doc.id,
          ...data,
          createdAt: data.createdAt?.toDate?.()?.toISOString() || null
        });
      });
      
      // Sort by createdAt in JavaScript
      subs.sort((a, b) => {
        const dateA = a.createdAt ? new Date(a.createdAt) : new Date(0);
        const dateB = b.createdAt ? new Date(b.createdAt) : new Date(0);
        return dateB - dateA; // descending order
      });
      
      setSubmissions(subs);
      setError('');
    } catch (err) {
      console.error('Fetch error:', err);
      setError(`Failed to load submissions: ${err.message}`);
    } finally {
      setLoading(false);
    }
  };

  const getStatusBadge = (status) => {
    const statusClasses = {
      pending: 'status-pending',
      reviewing: 'status-reviewing',
      verified: 'status-verified',
      accepted: 'status-accepted',
      rejected: 'status-rejected',
    };
    return statusClasses[status] || 'status-pending';
  };

  const getPaymentBadge = (paymentStatus) => {
    const statusClasses = {
      pending: 'status-pending',
      'confirmation-pending': 'status-reviewing',
      verified: 'status-verified',
      rejected: 'status-rejected',
    };
    return statusClasses[paymentStatus] || 'status-pending';
  };

  const handleLogout = async () => {
    setError('');
    setSuccessMessage('');
    setLoggingOut(true);

    try {
      await signOut();
      navigate('/login', { replace: true });
    } catch (logoutError) {
      console.error('Logout error:', logoutError);
      setError('Failed to log out. Please try again.');
    } finally {
      setLoggingOut(false);
    }
  };

  return (
    <div className="dashboard-container">
      <div className="dashboard-wrapper">
        {/* Hero Section */}
        <div className="dashboard-hero">
          <h1 className="dashboard-title">Dashboard</h1>
          <p className="dashboard-welcome">Welcome back, {user?.displayName || 'filmmaker'}</p>
        </div>

        {/* Actions */}
        <div className="dashboard-actions">
          <button 
            type="button" 
            className="submit-film-btn" 
            onClick={() => navigate('/submit')}
          >
            + Submit Film
          </button>
          <button
            type="button"
            className="logout-btn"
            onClick={handleLogout}
            disabled={loggingOut}
          >
            {loggingOut ? 'Logging Out...' : 'Logout'}
          </button>
        </div>

        {/* Brochure Info */}
        <div className="dashboard-info-section">
          <div className="info-content">
            <p className="info-title">Event Brochure</p>
            <p className="info-description">
              Download the complete LUMIERE 2026 brochure for detailed event information
            </p>
          </div>
          <a 
            href="https://drive.google.com/file/d/1UXi2SCWgXVPrBOWbAM5q6VLzNIYR0pNj/view?usp=sharing"
            target="_blank"
            rel="noopener noreferrer"
            className="info-action"
          >
            View Brochure
          </a>
        </div>

        {/* Messages */}
        {successMessage && (
          <div className="dashboard-message success-message">
            <span>OK</span>
            <span>{successMessage}</span>
          </div>
        )}

        {error && (
          <div className="dashboard-message error-message">
            <span>Error</span>
            <span>{error}</span>
          </div>
        )}

        {/* Submissions Section */}
        <div className="submissions-section">
          {loading ? (
            <div className="loading-container">
              <div className="loading-spinner" />
              <p>Loading your submissions...</p>
            </div>
          ) : submissions.length === 0 ? (
            <div className="empty-state">
              <div className="empty-icon" aria-hidden="true">
                <Film size={52} strokeWidth={1.8} />
              </div>
              <h2>No Submissions Yet</h2>
              <p>You haven't submitted any films yet. Start by submitting your first film!</p>
              <button 
                type="button" 
                className="submit-film-btn" 
                onClick={() => navigate('/submit')}
              >
                Submit Your Film
              </button>
            </div>
          ) : (
            <>
              <h2 className="submissions-title">Your Submissions</h2>
              <div className="submissions-grid">
                {submissions.map((submission) => (
                  <div key={submission.id} className="submission-card">
                    <div className="submission-header">
                      <h3 className="submission-title">{submission.title}</h3>
                      <div className="submission-badges">
                        <span className={`status-badge ${getPaymentBadge(submission.paymentStatus)}`}>
                          {submission.paymentStatus === 'verified' ? 'Verified' : 
                           submission.paymentStatus === 'rejected' ? 'Rejected' :
                           submission.paymentStatus === 'confirmation-pending' ? 'Confirming' :
                           'Pending Payment'}
                        </span>
                        {submission.status && submission.status !== 'submitted' && (
                          <span className={`status-badge ${getStatusBadge(submission.status)}`}>
                            {submission.status.charAt(0).toUpperCase() + submission.status.slice(1)}
                          </span>
                        )}
                      </div>
                    </div>
                    
                    <div className="submission-details">
                      <p><strong>Category:</strong> {submission.categoryName}</p>
                      <p><strong>Duration:</strong> {submission.duration || 'N/A'} min</p>
                      <p><strong>Fee:</strong> ₹{submission.fee || 'N/A'}</p>
                      <p><strong>Submitted:</strong> {new Date(submission.createdAt).toLocaleDateString()}</p>
                      <p><strong>ID:</strong> <code style={{ color: '#7ea2ff' }}>{submission.submissionId}</code></p>
                      {submission.verifiedBy && (
                        <p><strong>Verified by:</strong> {submission.verifiedBy}</p>
                      )}
                      
                      {/* Team Members */}
                      <div className="team-members-section">
                        <p><strong>Director:</strong> {submission.directorName}</p>
                        <p className="director-email">{submission.directorEmail}</p>
                        
                        {submission.teamMemberEmails && submission.teamMemberEmails.length > 0 && (
                          <div className="team-members-list">
                            <strong>Team Members:</strong>
                            <ul>
                              {submission.teamMemberEmails.map((email, index) => (
                                <li key={index}>{email}</li>
                              ))}
                            </ul>
                          </div>
                        )}
                      </div>
                    </div>

                    {/* Actions */}
                    <div className="submission-actions">
                      <a 
                        href={submission.filmLink?.startsWith('http') ? submission.filmLink : `https://${submission.filmLink}`}
                        target="_blank" 
                        rel="noopener noreferrer"
                        className="submission-btn btn-view"
                      >
                        View Film
                      </a>
                      {submission.paymentStatus === 'pending' && (
                        <button 
                          onClick={() => navigate('/payment', { state: { submission } })}
                          className="submission-btn btn-pay"
                        >
                          Pay Now
                        </button>
                      )}
                      {submission.paymentStatus === 'verified' && (
                        <div className="verified-badge">Payment Verified</div>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
}
