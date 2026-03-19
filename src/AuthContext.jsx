import { createContext, useContext, useState, useEffect } from 'react';
import { auth } from './firebaseAuth';
import {
  onAuthStateChanged,
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
  signOut as firebaseSignOut,
  updateProfile,
  GoogleAuthProvider,
  signInWithPopup,
  setPersistence,
  browserLocalPersistence
} from 'firebase/auth';

const AuthContext = createContext(null);
const googleProvider = new GoogleAuthProvider();
const LOCAL_TEST_EMAIL = 'pdc@pec.edu.in';
const LOCAL_TEST_PASSWORD = 'pdcamarrahe';
const LOCAL_DEV_SESSION_KEY = 'lumiere_local_dev_user';

const isLocalDev = () =>
  import.meta.env.DEV &&
  typeof window !== 'undefined' &&
  (window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1');

const buildLocalDevUser = (email, displayName = 'PDC Local') => ({
  uid: 'local-dev-user',
  email,
  displayName,
  isLocalDevUser: true,
  getIdToken: async () => 'local-dev-token',
});

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  // Keep users signed in across tab/browser restarts unless they explicitly sign out.
  useEffect(() => {
    setPersistence(auth, browserLocalPersistence).catch((err) => {
      console.error('Error setting auth persistence:', err);
    });
  }, []);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (firebaseUser) => {
      if (firebaseUser) {
        if (isLocalDev()) {
          localStorage.removeItem(LOCAL_DEV_SESSION_KEY);
        }
        setUser(firebaseUser);
        setLoading(false);
        return;
      }

      if (isLocalDev()) {
        try {
          const raw = localStorage.getItem(LOCAL_DEV_SESSION_KEY);
          if (raw) {
            const parsed = JSON.parse(raw);
            setUser(buildLocalDevUser(parsed.email || LOCAL_TEST_EMAIL, parsed.displayName));
            setLoading(false);
            return;
          }
        } catch (error) {
          console.warn('Failed to restore local dev session:', error);
        }
      }

      setUser(null);
      setLoading(false);
    });
    return unsubscribe;
  }, []);

  const signIn = async (email, password) => {
    if (
      isLocalDev() &&
      String(email || '').trim().toLowerCase() === LOCAL_TEST_EMAIL &&
      password === LOCAL_TEST_PASSWORD
    ) {
      const localUser = buildLocalDevUser(LOCAL_TEST_EMAIL);
      localStorage.setItem(
        LOCAL_DEV_SESSION_KEY,
        JSON.stringify({ email: LOCAL_TEST_EMAIL, displayName: localUser.displayName })
      );
      setUser(localUser);
      return { user: localUser };
    }

    return signInWithEmailAndPassword(auth, email, password);
  };

  const signUp = async (email, password, options = {}) => {
    const userCredential = await createUserWithEmailAndPassword(auth, email, password);
    
    // Update profile if displayName provided
    if (options.displayName && userCredential.user) {
      await updateProfile(userCredential.user, {
        displayName: options.displayName
      });
    }
    
    return userCredential;
  };

  const signOut = async () => {
    if (isLocalDev()) {
      localStorage.removeItem(LOCAL_DEV_SESSION_KEY);
      if (!auth.currentUser) {
        setUser(null);
        return;
      }
    }

    await firebaseSignOut(auth);
    setUser(null);
  };

  const signInWithGoogle = async () => {
    return signInWithPopup(auth, googleProvider);
  };

  const getToken = async () => {
    if (!user) {
      throw new Error('No authenticated user');
    }
    if (user.isLocalDevUser) {
      return 'local-dev-token';
    }
    try {
      const token = await user.getIdToken(true); // Force refresh
      return token;
    } catch (error) {
      console.error('Error getting token:', error);
      throw error;
    }
  };

  const value = {
    user,
    loading,
    signIn,
    signUp,
    signOut,
    signInWithGoogle,
    getToken
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within AuthProvider');
  }
  return context;
}
