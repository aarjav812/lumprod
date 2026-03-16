import { auth } from '../firebaseAuth';
import { db } from '../firebaseDb';
import { 
  collection, 
  doc, 
  getDoc,
  getDocs, 
  updateDoc,
  query, 
  where,
  orderBy,
  serverTimestamp
} from 'firebase/firestore';
import { 
  signInWithEmailAndPassword,
  signOut,
  setPersistence,
  browserSessionPersistence
} from 'firebase/auth';

const LOCAL_ADMIN_EMAIL = 'pdc@pec.edu.in';
const LOCAL_ADMIN_PASSWORD = 'pdcamarrahe';
const LOCAL_ADMIN_SESSION_KEY = 'lumiere_local_admin_session';

const isLocalDev = () =>
  import.meta.env.DEV &&
  typeof window !== 'undefined' &&
  (window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1');

const normalizeEmail = (email) => String(email || '').trim().toLowerCase();

const isVerifiedAdminRecord = (data) => {
  if (!data) return false;
  return data.verified === true || data.verified === 'true';
};

const getAdminDocSnapshot = async (userId, email) => {
  const references = [];

  if (userId) {
    references.push(doc(db, 'admin', userId));
  }

  const normalizedEmail = normalizeEmail(email);
  if (normalizedEmail && normalizedEmail !== userId) {
    references.push(doc(db, 'admin', normalizedEmail));
  }

  for (const reference of references) {
    const snapshot = await getDoc(reference);
    if (snapshot.exists()) {
      return snapshot;
    }
  }

  return null;
};

/**
 * Admin Service
 * Handles admin authentication and operations
 */

/**
 * Check if user is admin
 */
export const isAdmin = async (userId, email) => {
  try {
    if (!userId && !email) return false;

    const adminDoc = await getAdminDocSnapshot(userId, email);
    return Boolean(adminDoc && isVerifiedAdminRecord(adminDoc.data()));
  } catch (error) {
    console.error('Error checking admin status:', error);
    return false;
  }
};

/**
 * Get admin details
 */
export const getAdminDetails = async (userId, email) => {
  try {
    const adminDoc = await getAdminDocSnapshot(userId, email);

    if (adminDoc?.exists()) {
      return {
        id: adminDoc.id,
        ...adminDoc.data(),
        createdAt: adminDoc.data().createdAt?.toDate?.() || adminDoc.data().createdAt,
      };
    }

    return null;
  } catch (error) {
    console.error('Error getting admin details:', error);
    throw error;
  }
};

/**
 * Admin login with email/password
 * Note: Admin account should be created manually in Firestore
 * Collection: admin/{uid} or admin/{email}
 * Fields: { email, name, role: 'admin', verified: true, createdAt }
 */
export const adminLogin = async (email, password) => {
  const shouldAllowLocalFallback =
    isLocalDev() &&
    String(email || '').trim().toLowerCase() === LOCAL_ADMIN_EMAIL &&
    password === LOCAL_ADMIN_PASSWORD;

  try {
    // Set session persistence
    await setPersistence(auth, browserSessionPersistence);

    // Sign in with Firebase Auth
    const userCredential = await signInWithEmailAndPassword(auth, email, password);
    const user = userCredential.user;

    // Check if user is admin
    const adminStatus = await isAdmin(user.uid, user.email);
    
    if (!adminStatus) {
      // Sign out if not admin
      await signOut(auth);
      throw new Error('Unauthorized: Admin access required. Add admin/{uid} or admin/{email} with verified: true.');
    }

    // Get admin details
    const adminDetails = await getAdminDetails(user.uid, user.email);

    return {
      success: true,
      user,
      admin: adminDetails
    };
  } catch (error) {
    if (shouldAllowLocalFallback) {
      const localAdmin = {
        id: 'local-admin',
        email: LOCAL_ADMIN_EMAIL,
        name: 'Local Admin',
        role: 'admin',
        verified: true,
        isLocalDevAdmin: true,
      };

      localStorage.setItem(LOCAL_ADMIN_SESSION_KEY, JSON.stringify(localAdmin));

      return {
        success: true,
        user: { uid: 'local-admin', email: LOCAL_ADMIN_EMAIL },
        admin: localAdmin,
      };
    }

    console.error('Error during admin login:', error);
    
    // Handle specific Firebase auth errors
    if (error.code === 'auth/user-not-found') {
      throw new Error('Admin account not found');
    } else if (error.code === 'auth/wrong-password') {
      throw new Error('Invalid password');
    } else if (error.code === 'auth/invalid-email') {
      throw new Error('Invalid email format');
    } else if (error.code === 'auth/too-many-requests') {
      throw new Error('Too many failed attempts. Please try again later.');
    }
    
    throw error;
  }
};

/**
 * Admin logout
 */
export const adminLogout = async () => {
  try {
    if (isLocalDev()) {
      localStorage.removeItem(LOCAL_ADMIN_SESSION_KEY);
    }
    await signOut(auth);
    return { success: true };
  } catch (error) {
    console.error('Error during admin logout:', error);
    throw error;
  }
};

export const getLocalAdminSession = () => {
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

/**
 * Get all users (Admin)
 */
export const getAllUsers = async () => {
  try {
    const usersSnapshot = await getDocs(collection(db, 'users'));
    const users = [];

    usersSnapshot.forEach((doc) => {
      users.push({
        id: doc.id,
        ...doc.data(),
        createdAt: doc.data().createdAt?.toDate?.() || doc.data().createdAt,
        updatedAt: doc.data().updatedAt?.toDate?.() || doc.data().updatedAt,
        lastLoginAt: doc.data().lastLoginAt?.toDate?.() || doc.data().lastLoginAt,
      });
    });

    return users;
  } catch (error) {
    console.error('Error getting all users:', error);
    throw error;
  }
};

/**
 * Get user by ID (Admin)
 */
export const getUserById = async (userId) => {
  try {
    const userRef = doc(db, 'users', userId);
    const userDoc = await getDoc(userRef);

    if (userDoc.exists()) {
      return {
        id: userDoc.id,
        ...userDoc.data(),
        createdAt: userDoc.data().createdAt?.toDate?.() || userDoc.data().createdAt,
        updatedAt: userDoc.data().updatedAt?.toDate?.() || userDoc.data().updatedAt,
        lastLoginAt: userDoc.data().lastLoginAt?.toDate?.() || userDoc.data().lastLoginAt,
      };
    }

    return null;
  } catch (error) {
    console.error('Error getting user:', error);
    throw error;
  }
};

/**
 * Search users by email (Admin)
 */
export const searchUsersByEmail = async (emailQuery) => {
  try {
    const q = query(
      collection(db, 'users'),
      where('email', '>=', emailQuery.toLowerCase()),
      where('email', '<=', emailQuery.toLowerCase() + '\uf8ff')
    );

    const querySnapshot = await getDocs(q);
    const users = [];

    querySnapshot.forEach((doc) => {
      users.push({
        id: doc.id,
        ...doc.data(),
        createdAt: doc.data().createdAt?.toDate?.() || doc.data().createdAt,
      });
    });

    return users;
  } catch (error) {
    console.error('Error searching users:', error);
    throw error;
  }
};

/**
 * Get dashboard statistics (Admin)
 */
export const getDashboardStats = async () => {
  try {
    // Get counts from all collections
    const [usersSnap, submissionsSnap] = await Promise.all([
      getDocs(collection(db, 'users')),
      getDocs(collection(db, 'submissions'))
    ]);

    // Calculate submission stats
    let pendingSubmissions = 0;
    let verifiedSubmissions = 0;
    let totalRevenue = 0;

    submissionsSnap.forEach((doc) => {
      const data = doc.data();
      if (data.paymentStatus === 'pending') pendingSubmissions++;
      if (data.paymentStatus === 'verified') {
        verifiedSubmissions++;
        totalRevenue += data.fee || 0;
      }
    });

    return {
      totalUsers: usersSnap.size,
      totalSubmissions: submissionsSnap.size,
      totalRegistrations: submissionsSnap.size, // For backward compatibility
      pendingRegistrations: pendingSubmissions,
      verifiedRegistrations: verifiedSubmissions,
      totalRevenue
    };
  } catch (error) {
    console.error('Error getting dashboard stats:', error);
    throw error;
  }
};

/**
 * Update user details (Admin)
 */
export const updateUser = async (userId, userData) => {
  try {
    const userRef = doc(db, 'users', userId);
    
    await updateDoc(userRef, {
      ...userData,
      updatedAt: serverTimestamp()
    });

    return { success: true };
  } catch (error) {
    console.error('Error updating user:', error);
    throw error;
  }
};

/**
 * Get recent activities (Admin)
 * Get recent submissions sorted by date
 */
export const getRecentActivities = async (limit = 10) => {
  try {
    // Get recent submissions
    const submissionsSnapshot = await getDocs(
      query(collection(db, 'submissions'), orderBy('createdAt', 'desc'))
    );

    const activities = [];

    submissionsSnapshot.forEach((doc) => {
      const data = doc.data();
      activities.push({
        type: 'submission',
        id: doc.id,
        ...data,
        timestamp: data.createdAt?.toDate?.() || data.createdAt || new Date(),
      });
    });

    return activities.slice(0, limit);
  } catch (error) {
    console.error('Error getting recent activities:', error);
    throw error;
  }
};
