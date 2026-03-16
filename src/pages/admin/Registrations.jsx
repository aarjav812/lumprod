import { useState, useEffect } from 'react';
import AdminNavbar from '../../components/admin/AdminNavbar';
import { db } from '../../firebaseDb';
import { collection, getDocs, doc, updateDoc, query, orderBy } from 'firebase/firestore';
import { useAdmin } from '../../contexts/AdminContext';
import './AdminCommon.css';
import './Registrations.css';

export default function Registrations() {
  const [submissions, setSubmissions] = useState([]);
  const [filteredSubmissions, setFilteredSubmissions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState('all');
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedSubmission, setSelectedSubmission] = useState(null);
  const [showModal, setShowModal] = useState(false);
  const { admin } = useAdmin();

  useEffect(() => {
    loadSubmissions();
  }, []);

  useEffect(() => {
    filterSubmissions();
  }, [filter, searchTerm, submissions]);

  const loadSubmissions = async () => {
    try {
      const q = query(collection(db, 'lumiere_submissions'), orderBy('createdAt', 'desc'));
      const snapshot = await getDocs(q);
      const data = [];
      snapshot.forEach((docSnap) => {
        const submission = docSnap.data();
        data.push({
          id: docSnap.id,
          ...submission,
          createdAt: submission.createdAt?.toDate?.() || null,
          updatedAt: submission.updatedAt?.toDate?.() || null,
        });
      });
      setSubmissions(data);
      setFilteredSubmissions(data);
    } catch (error) {
      console.error('Error loading submissions:', error);
      alert('Failed to load submissions: ' + error.message);
    } finally {
      setLoading(false);
    }
  };

  const filterSubmissions = () => {
    let filtered = [...submissions];

    // Filter by status
    if (filter !== 'all') {
      filtered = filtered.filter(sub => 
        (filter === 'pending' && sub.paymentStatus === 'pending') ||
        (filter === 'verified' && sub.paymentStatus === 'verified') ||
        (filter === 'rejected' && sub.paymentStatus === 'rejected')
      );
    }

    // Search filter
    if (searchTerm) {
      const term = searchTerm.toLowerCase();
      filtered = filtered.filter(sub =>
        sub.title?.toLowerCase().includes(term) ||
        sub.submissionId?.toLowerCase().includes(term) ||
        sub.directorName?.toLowerCase().includes(term) ||
        sub.directorEmail?.toLowerCase().includes(term) ||
        sub.categoryName?.toLowerCase().includes(term)
      );
    }

    setFilteredSubmissions(filtered);
  };

  const handleViewDetails = (submission) => {
    setSelectedSubmission(submission);
    setShowModal(true);
  };

  const handleUpdateStatus = async (submissionId, newStatus) => {
    try {
      const docRef = doc(db, 'lumiere_submissions', submissionId);
      await updateDoc(docRef, {
        paymentStatus: newStatus,
        verifiedBy: admin?.email || 'admin',
        verifiedAt: new Date()
      });

      // Update local state
      setSubmissions(prev =>
        prev.map(sub =>
          sub.id === submissionId
            ? { ...sub, paymentStatus: newStatus, verifiedBy: admin?.email }
            : sub
        )
      );

      alert(`Submission ${newStatus} successfully!`);
      setShowModal(false);
    } catch (error) {
      console.error('Error updating status:', error);
      alert('Failed to update status');
    }
  };

  const getStatusCount = (status) => {
    if (status === 'all') return submissions.length;
    return submissions.filter(sub => sub.paymentStatus === status).length;
  };

  const formatDate = (date) => {
    if (!date) return 'N/A';
    const d = date instanceof Date ? date : new Date(date);
    return d.toLocaleDateString('en-IN', { 
      day: '2-digit', 
      month: 'short', 
      year: 'numeric' 
    });
  };

  const formatDateTime = (date) => {
    if (!date) return 'N/A';
    const d = date instanceof Date ? date : new Date(date);
    return d.toLocaleDateString('en-IN', { 
      day: '2-digit', 
      month: 'short', 
      year: 'numeric' 
    }) + ' at ' + d.toLocaleTimeString('en-IN', { 
      hour: '2-digit', 
      minute: '2-digit',
      hour12: true 
    });
  };

  if (loading) {
    return (
      <>
        <AdminNavbar />
        <div className="admin-page">
          <div className="loading">Loading submissions...</div>
        </div>
      </>
    );
  }

  return (
    <>
      <AdminNavbar />
      <div className="admin-page">
        <div className="admin-header">
          <h1>Film Submissions ({submissions.length})</h1>
        </div>

        <div className="registrations-controls">
          <div className="filter-buttons">
            <button
              className={filter === 'all' ? 'active' : ''}
              onClick={() => setFilter('all')}
            >
              All ({getStatusCount('all')})
            </button>
            <button
              className={filter === 'pending' ? 'active' : ''}
              onClick={() => setFilter('pending')}
            >
              Pending ({getStatusCount('pending')})
            </button>
            <button
              className={filter === 'verified' ? 'active' : ''}
              onClick={() => setFilter('verified')}
            >
              Verified ({getStatusCount('verified')})
            </button>
            <button
              className={filter === 'rejected' ? 'active' : ''}
              onClick={() => setFilter('rejected')}
            >
              Rejected ({getStatusCount('rejected')})
            </button>
          </div>

          <div className="search-box">
            <input
              type="text"
              placeholder="Search by title, ID, director..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
        </div>

        <div className="registrations-list">
          {filteredSubmissions.length === 0 ? (
            <p className="no-data">No submissions found</p>
          ) : (
            <div className="table-container">
              <table className="data-table">
                <thead>
                  <tr>
                    <th>ID</th>
                    <th>Title</th>
                    <th>Category</th>
                    <th>Director</th>
                    <th>Email</th>
                    <th>Fee</th>
                    <th>Status</th>
                    <th>Submitted</th>
                    <th>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredSubmissions.map((submission) => (
                    <tr key={submission.id}>
                      <td><span className="reg-id">{submission.submissionId}</span></td>
                      <td className="title-cell"><strong>{submission.title}</strong></td>
                      <td>{submission.categoryName}</td>
                      <td><strong>{submission.directorName}</strong></td>
                      <td className="email-cell">{submission.directorEmail}</td>
                      <td className="fees-cell">₹{submission.fee}</td>
                      <td>
                        <span className={`status-badge status-${submission.paymentStatus || 'pending'}`}>
                          {submission.paymentStatus || 'pending'}
                        </span>
                      </td>
                      <td className="date-cell">{formatDate(submission.createdAt)}</td>
                      <td>
                        <button
                          onClick={() => handleViewDetails(submission)}
                          className="action-btn-review"
                        >
                          View
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>

        {showModal && selectedSubmission && (
          <div className="modal-overlay" onClick={() => setShowModal(false)}>
            <div className="modal-content" onClick={(e) => e.stopPropagation()}>
              <button className="modal-close" onClick={() => setShowModal(false)}>×</button>
              
              <h2>Submission Details</h2>
              
              <div className="modal-details">
                <div className="detail-section">
                  <h3>Film Information</h3>
                  <div className="detail-grid">
                    <div className="detail-item">
                      <label>Submission ID</label>
                      <span>{selectedSubmission.submissionId}</span>
                    </div>
                    <div className="detail-item">
                      <label>Title</label>
                      <span>{selectedSubmission.title}</span>
                    </div>
                    <div className="detail-item">
                      <label>Category</label>
                      <span>{selectedSubmission.categoryName}</span>
                    </div>
                    <div className="detail-item">
                      <label>Duration</label>
                      <span>{selectedSubmission.duration} min</span>
                    </div>
                    <div className="detail-item">
                      <label>Language</label>
                      <span>{selectedSubmission.language}</span>
                    </div>
                    <div className="detail-item">
                      <label>Fee</label>
                      <span>₹{selectedSubmission.fee}</span>
                    </div>
                  </div>
                  <div className="detail-item full-width">
                    <label>Synopsis</label>
                    <p>{selectedSubmission.synopsis}</p>
                  </div>
                </div>

                <div className="detail-section">
                  <h3>Director / Team</h3>
                  <div className="detail-grid">
                    <div className="detail-item">
                      <label>Director Name</label>
                      <span>{selectedSubmission.directorName}</span>
                    </div>
                    <div className="detail-item">
                      <label>Email</label>
                      <span>{selectedSubmission.directorEmail}</span>
                    </div>
                    <div className="detail-item">
                      <label>Phone</label>
                      <span>{selectedSubmission.directorPhone}</span>
                    </div>
                  </div>
                  {selectedSubmission.teamMembers && (
                    <div className="detail-item full-width">
                      <label>Team Members</label>
                      <p>{selectedSubmission.teamMembers}</p>
                    </div>
                  )}
                </div>

                <div className="detail-section">
                  <h3>Links</h3>
                  <div className="links-grid">
                    {selectedSubmission.filmLink && (
                      <a href={selectedSubmission.filmLink} target="_blank" rel="noopener noreferrer" className="link-button">
                        View Film
                      </a>
                    )}
                    {selectedSubmission.posterLink && (
                      <a href={selectedSubmission.posterLink} target="_blank" rel="noopener noreferrer" className="link-button">
                        View Poster
                      </a>
                    )}
                    {selectedSubmission.subtitlesLink && (
                      <a href={selectedSubmission.subtitlesLink} target="_blank" rel="noopener noreferrer" className="link-button">
                        View Subtitles
                      </a>
                    )}
                  </div>
                </div>

                <div className="detail-section">
                  <h3>Status Information</h3>
                  <div className="detail-grid">
                    <div className="detail-item">
                      <label>Payment Status</label>
                      <span className={`status-badge ${selectedSubmission.paymentStatus || 'pending'}`}>
                        {selectedSubmission.paymentStatus || 'pending'}
                      </span>
                    </div>
                    {selectedSubmission.transactionId && (
                      <div className="detail-item">
                        <label>Transaction ID</label>
                        <span className="transaction-id">{selectedSubmission.transactionId}</span>
                      </div>
                    )}
                    <div className="detail-item">
                      <label>Submitted On</label>
                      <span>{formatDateTime(selectedSubmission.createdAt)}</span>
                    </div>
                    {selectedSubmission.verifiedBy && (
                      <>
                        <div className="detail-item">
                          <label>Verified By</label>
                          <span>{selectedSubmission.verifiedBy}</span>
                        </div>
                        <div className="detail-item">
                          <label>Verified At</label>
                          <span>{formatDateTime(selectedSubmission.verifiedAt)}</span>
                        </div>
                      </>
                    )}
                  </div>
                </div>

                <div className="modal-actions">
                  {selectedSubmission.paymentStatus !== 'verified' && (
                    <button
                      onClick={() => handleUpdateStatus(selectedSubmission.id, 'verified')}
                      className="btn-verify"
                    >
                      Verify Payment
                    </button>
                  )}
                  {selectedSubmission.paymentStatus !== 'rejected' && (
                    <button
                      onClick={() => handleUpdateStatus(selectedSubmission.id, 'rejected')}
                      className="btn-reject"
                    >
                      Reject
                    </button>
                  )}
                  {selectedSubmission.paymentStatus !== 'pending' && (
                    <button
                      onClick={() => handleUpdateStatus(selectedSubmission.id, 'pending')}
                      className="btn-pending"
                    >
                      ↻ Mark Pending
                    </button>
                  )}
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </>
  );
}
