import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { adminLogin } from '../../services/adminService';
import { useAdmin } from '../../contexts/AdminContext';
import './AdminLogin.css';

const LOCAL_ADMIN_EMAIL = 'pdc@pec.edu.in';
const LOCAL_ADMIN_PASSWORD = 'pdcamarrahe';

const isLocalDev =
  import.meta.env.DEV &&
  typeof window !== 'undefined' &&
  (window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1');

export default function AdminLogin() {
  const [email, setEmail] = useState(isLocalDev ? LOCAL_ADMIN_EMAIL : '');
  const [password, setPassword] = useState(isLocalDev ? LOCAL_ADMIN_PASSWORD : '');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();
  const { setAdmin, setIsAdminUser } = useAdmin();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      const result = await adminLogin(email.trim(), password);
      setAdmin(result.admin);
      setIsAdminUser(true);
      navigate('/admin');
    } catch (error) {
      setError(error.message || 'Login failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="admin-login-page">
      <div className="admin-login-container">
        <div className="admin-login-header">
          <h1>Lumiere Admin</h1>
          <p>Sign in to access the admin portal</p>
        </div>

        <form onSubmit={handleSubmit} className="admin-login-form">
          {error && (
            <div className="error-message">
              {error}
            </div>
          )}

          <div className="form-group">
            <label htmlFor="email">Email Address</label>
            <input
              type="email"
              id="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="admin@lumiere.com"
              required
              autoComplete="email"
            />
          </div>

          <div className="form-group">
            <label htmlFor="password">Password</label>
            <input
              type="password"
              id="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="Enter your password"
              required
              autoComplete="current-password"
            />
          </div>

          <button 
            type="submit" 
            className="admin-login-btn"
            disabled={loading}
          >
            {loading ? 'Signing in...' : 'Sign In'}
          </button>
        </form>

        <div className="admin-login-footer">
          <p>Admin access only. Unauthorized access is prohibited.</p>
        </div>
      </div>
    </div>
  );
}
