import { createContext, useContext, useState, useEffect } from 'react';
import PropTypes from 'prop-types';
import { auth } from '../firebaseAuth';
import { onAuthStateChanged } from 'firebase/auth';

const AdminContext = createContext(null);
const LOCAL_ADMIN_SESSION_KEY = 'lumiere_local_admin_session';

const isLocalDev = () =>
  import.meta.env.DEV &&
  typeof window !== 'undefined' &&
  (window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1');

const readLocalAdminSession = () => {
  if (!isLocalDev()) return null;

  try {
    const raw = localStorage.getItem(LOCAL_ADMIN_SESSION_KEY);
    if (!raw) return null;
    const parsed = JSON.parse(raw);
    if (!parsed?.email) return null;
    return parsed;
  } catch {
    return null;
  }
};

export const useAdmin = () => {
  const context = useContext(AdminContext);
  if (!context) {
    throw new Error('useAdmin must be used within AdminProvider');
  }
  return context;
};

export const AdminProvider = ({ children }) => {
  const [admin, setAdmin] = useState(null);
  const [isAdminUser, setIsAdminUser] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      setLoading(true);
      
      if (user) {
        try {
          const { isAdmin, getAdminDetails } = await import('../services/adminService');

          // Check if user is admin
          const adminStatus = await isAdmin(user.uid, user.email);
          
          if (adminStatus) {
            const adminDetails = await getAdminDetails(user.uid, user.email);
            setAdmin(adminDetails);
            setIsAdminUser(true);
          } else {
            setAdmin(null);
            setIsAdminUser(false);
          }
        } catch (error) {
          console.error('Error checking admin status:', error);
          setAdmin(null);
          setIsAdminUser(false);
        }
      } else {
        const localAdminSession = readLocalAdminSession();
        if (localAdminSession) {
          setAdmin(localAdminSession);
          setIsAdminUser(true);
        } else {
          setAdmin(null);
          setIsAdminUser(false);
        }
      }
      
      setLoading(false);
    });

    return () => unsubscribe();
  }, []);

  const value = {
    admin,
    isAdminUser,
    loading,
    setAdmin,
    setIsAdminUser
  };

  return (
    <AdminContext.Provider value={value}>
      {children}
    </AdminContext.Provider>
  );
};

AdminProvider.propTypes = {
  children: PropTypes.node.isRequired
};
