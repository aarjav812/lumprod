import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import AdminNavbar from '../../components/admin/AdminNavbar';
import { db } from '../../firebaseDb';
import { collection, getDocs, query, orderBy } from 'firebase/firestore';
import './AdminDashboard.css';

export default function AdminDashboard() {
  const [stats, setStats] = useState(null);
  const [activities, setActivities] = useState([]);
  const [portalUsers, setPortalUsers] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadDashboardData();
  }, []);

  const loadDashboardData = async () => {
    try {
      const submissionsQuery = query(collection(db, 'lumiere_submissions'), orderBy('createdAt', 'desc'));
      const usersQuery = query(collection(db, 'users'), orderBy('createdAt', 'desc'));
      const [snapshot, usersSnapshot] = await Promise.all([
        getDocs(submissionsQuery),
        getDocs(usersQuery),
      ]);
      
      let submissions = [];
      let totalRevenue = 0;
      let pendingCount = 0;
      let verifiedCount = 0;

      snapshot.forEach((docSnap) => {
        const submission = docSnap.data();
        submissions.push({
          id: docSnap.id,
          ...submission,
          createdAt: submission.createdAt?.toDate?.() || null,
        });

        if (submission.paymentStatus === 'verified') {
          verifiedCount++;
          totalRevenue += submission.fee || 0;
        } else if (submission.paymentStatus === 'pending' || submission.paymentStatus === 'confirmation-pending') {
          pendingCount++;
        }
      });

      setStats({
        totalUsers: new Set(submissions.map(s => s.directorEmail)).size,
        totalSubmissions: submissions.length,
        pendingRegistrations: pendingCount,
        verifiedRegistrations: verifiedCount,
        totalRevenue: totalRevenue
      });

      setActivities(submissions.slice(0, 10));

      const users = usersSnapshot.docs.map((docSnap) => {
        const user = docSnap.data();
        return {
          id: docSnap.id,
          ...user,
          createdAt: user.createdAt?.toDate?.() || null,
          updatedAt: user.updatedAt?.toDate?.() || null,
        };
      });

      setPortalUsers(users);
    } catch (error) {
      console.error('Error loading dashboard:', error);
    } finally {
      setLoading(false);
    }
  };

  const formatDateTime = (date) => {
    if (!date) return 'N/A';
    const d = date instanceof Date ? date : new Date(date);
    if (Number.isNaN(d.getTime())) return 'N/A';
    return d.toLocaleDateString('en-IN', {
      day: '2-digit',
      month: 'short',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
      hour12: true,
    });
  };

  const escapeXml = (value) => {
    return String(value ?? '')
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;')
      .replace(/'/g, '&apos;');
  };

  const downloadUsersExcel = () => {
    if (!portalUsers.length) return;

    const headers = [
      'User ID',
      'Name',
      'Email',
      'Phone',
      'College',
      'Status',
      'Email Verified',
      'Created At',
      'Updated At',
      'Registrations Count',
      'Teams Count',
    ];

    const rows = portalUsers.map((user) => [
      user.id,
      user.name || '',
      user.email || '',
      user.phoneNumber || '',
      user.collegeName || '',
      user.status || '',
      user.emailVerified ? 'Yes' : 'No',
      formatDateTime(user.createdAt),
      formatDateTime(user.updatedAt),
      Array.isArray(user.registrations) ? user.registrations.length : 0,
      Array.isArray(user.teams) ? user.teams.length : 0,
    ]);

    const allRows = [headers, ...rows]
      .map((row) => `<Row>${row.map((cell) => `<Cell><Data ss:Type="String">${escapeXml(cell)}</Data></Cell>`).join('')}</Row>`)
      .join('');

    const xml = `<?xml version="1.0"?>
<?mso-application progid="Excel.Sheet"?>
<Workbook xmlns="urn:schemas-microsoft-com:office:spreadsheet"
 xmlns:o="urn:schemas-microsoft-com:office:office"
 xmlns:x="urn:schemas-microsoft-com:office:excel"
 xmlns:ss="urn:schemas-microsoft-com:office:spreadsheet"
 xmlns:html="http://www.w3.org/TR/REC-html40">
 <Worksheet ss:Name="Portal Users">
  <Table>${allRows}</Table>
 </Worksheet>
</Workbook>`;

    const blob = new Blob([xml], { type: 'application/vnd.ms-excel;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    const today = new Date().toISOString().slice(0, 10);

    link.href = url;
    link.download = `lumiere-portal-users-${today}.xls`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  };

  if (loading) {
    return (
      <>
        <AdminNavbar />
        <div className="admin-page">
          <div className="loading">Loading dashboard...</div>
        </div>
      </>
    );
  }

  return (
    <>
      <AdminNavbar />
      <div className="admin-page">
        <div className="admin-header">
          <h1>Dashboard</h1>
          <p>Overview of Lumiere 2026</p>
        </div>

        <div className="stats-grid">
          <Link to="/admin/registrations" className="stat-card">
            <div className="stat-icon" style={{ background: 'linear-gradient(135deg, #60a5fa, #3b82f6)' }}>
              SUB
            </div>
            <div className="stat-info">
              <h3>{stats?.totalSubmissions || 0}</h3>
              <p>Film Submissions</p>
            </div>
          </Link>

          <div className="stat-card">
            <div className="stat-icon" style={{ background: 'linear-gradient(135deg, #fbbf24, #f59e0b)' }}>
              PND
            </div>
            <div className="stat-info">
              <h3>{stats?.pendingRegistrations || 0}</h3>
              <p>Pending Verification</p>
            </div>
          </div>

          <div className="stat-card">
            <div className="stat-icon" style={{ background: 'linear-gradient(135deg, #10b981, #059669)' }}>
              OK
            </div>
            <div className="stat-info">
              <h3>{stats?.verifiedRegistrations || 0}</h3>
              <p>Verified</p>
            </div>
          </div>

          <div className="stat-card revenue-card">
            <div className="stat-icon" style={{ background: 'linear-gradient(135deg, #10b981, #059669)' }}>
              INR
            </div>
            <div className="stat-info">
              <h3>₹{stats?.totalRevenue?.toLocaleString() || 0}</h3>
              <p>Total Revenue</p>
            </div>
          </div>
        </div>

        <div className="recent-activities">
          <h2>Recent Submissions</h2>
          {activities.length === 0 ? (
            <p className="no-activities">No recent submissions</p>
          ) : (
            <div className="activities-list">
              {activities.map((activity, index) => (
                <div key={index} className="activity-item">
                  <div className="activity-icon">
                    FILM
                  </div>
                  <div className="activity-content">
                    <p className="activity-title">
                      <strong>{activity.directorName || activity.userEmail}</strong> submitted{' '}
                      <strong>{activity.title}</strong>
                    </p>
                    <p className="activity-subtitle">
                      {activity.categoryName} • {activity.duration} min • ₹{activity.fee}
                    </p>
                    <p className="activity-time">
                      {activity.timestamp instanceof Date
                        ? activity.timestamp.toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit', hour12: true })
                        : new Date(activity.timestamp).toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit', hour12: true })}
                    </p>
                  </div>
                  <div className={`activity-status status-${activity.paymentStatus || 'pending'}`}>
                    {activity.paymentStatus === 'verified' ? 'Verified' : 
                     activity.paymentStatus === 'rejected' ? 'Rejected' : 
                     'Pending'}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        <div className="quick-actions">
          <h2>Quick Actions</h2>
          <div className="actions-grid">
            <Link to="/admin/registrations" className="action-btn">
              View Submissions
            </Link>
          </div>
        </div>

        <div className="portal-users">
          <div className="portal-users-header">
            <h2>Main Portal Signups ({portalUsers.length})</h2>
            <button
              type="button"
              className="action-btn download-btn"
              onClick={downloadUsersExcel}
              disabled={portalUsers.length === 0}
            >
              Download Excel
            </button>
          </div>

          {portalUsers.length === 0 ? (
            <p className="no-activities">No users have signed up yet.</p>
          ) : (
            <div className="portal-users-table-wrap">
              <table className="portal-users-table">
                <thead>
                  <tr>
                    <th>Name</th>
                    <th>Email</th>
                    <th>Phone</th>
                    <th>College</th>
                  </tr>
                </thead>
                <tbody>
                  {portalUsers.map((user) => (
                    <tr key={user.id}>
                      <td>{user.name || 'N/A'}</td>
                      <td>{user.email || 'N/A'}</td>
                      <td>{user.phoneNumber || 'N/A'}</td>
                      <td>{user.collegeName || 'N/A'}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>
    </>
  );
}
