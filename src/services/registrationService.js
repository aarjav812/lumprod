import { db } from '../firebaseDb';
import { 
  collection, 
  addDoc, 
  getDocs, 
  deleteDoc,
  query, 
  where,
  serverTimestamp
} from 'firebase/firestore';

const USER_REG_CACHE_TTL_MS = 30 * 1000;
const userRegistrationsCache = new Map();

const getUserCacheKey = (userId) => String(userId || '');

const invalidateUserRegistrationCache = (userId) => {
  if (!userId) return;
  userRegistrationsCache.delete(getUserCacheKey(userId));
};

const readUserRegistrationCache = (userId) => {
  const key = getUserCacheKey(userId);
  const cached = userRegistrationsCache.get(key);
  if (!cached) return null;
  if (Date.now() - cached.cachedAt > USER_REG_CACHE_TTL_MS) {
    userRegistrationsCache.delete(key);
    return null;
  }
  return cached.value;
};

const writeUserRegistrationCache = (userId, value) => {
  userRegistrationsCache.set(getUserCacheKey(userId), {
    cachedAt: Date.now(),
    value,
  });
};

/**
 * Registration Service
 * Handles workshop and fun event registrations
 */

/**
 * Register user for a workshop or fun event
 */
export const registerForEvent = async (userId, userEmail, userName, eventId, eventName, eventType) => {
  try {
    if (!userId || !eventId) {
      throw new Error('User ID and Event ID are required');
    }

    // Check if already registered
    const existingRegistration = await checkRegistration(userId, eventId, eventType);
    if (existingRegistration) {
      throw new Error('Already registered for this event');
    }

    const collectionName = eventType === 'workshop' ? 'workshopRegistrations' : 'funEventRegistrations';
    
    const registration = {
      userId,
      userEmail,
      userName,
      eventId,
      eventName,
      eventType,
      registeredAt: serverTimestamp(),
      status: 'registered'
    };

    const docRef = await addDoc(collection(db, collectionName), registration);
    invalidateUserRegistrationCache(userId);
    
    return { 
      success: true, 
      id: docRef.id,
      message: 'Successfully registered for the event'
    };
  } catch (error) {
    console.error('Error registering for event:', error);
    throw new Error(error.message || 'Failed to register for event');
  }
};

/**
 * Check if user is already registered for an event
 */
export const checkRegistration = async (userId, eventId, eventType) => {
  try {
    if (!userId || !eventId) {
      return false;
    }

    const collectionName = eventType === 'workshop' ? 'workshopRegistrations' : 'funEventRegistrations';
    
    const q = query(
      collection(db, collectionName),
      where('userId', '==', userId),
      where('eventId', '==', eventId)
    );

    const querySnapshot = await getDocs(q);
    return !querySnapshot.empty;
  } catch (error) {
    console.error('Error checking registration:', error);
    return false;
  }
};

/**
 * Get all registrations for a user
 */
export const getUserRegistrations = async (userId) => {
  try {
    if (!userId) {
      return { workshops: [], funEvents: [] };
    }

    const cached = readUserRegistrationCache(userId);
    if (cached) return cached;

    const workshopQuery = query(
      collection(db, 'workshopRegistrations'),
      where('userId', '==', userId)
    );
    const funEventQuery = query(
      collection(db, 'funEventRegistrations'),
      where('userId', '==', userId)
    );

    const [workshopSnapshot, funEventSnapshot] = await Promise.all([
      getDocs(workshopQuery),
      getDocs(funEventQuery),
    ]);

    const workshops = workshopSnapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data(),
      registeredAt: doc.data().registeredAt?.toDate?.() || doc.data().registeredAt
    }));

    const funEvents = funEventSnapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data(),
      registeredAt: doc.data().registeredAt?.toDate?.() || doc.data().registeredAt
    }));

    const value = { workshops, funEvents };
    writeUserRegistrationCache(userId, value);
    return value;
  } catch (error) {
    console.error('Error getting user registrations:', error);
    return { workshops: [], funEvents: [] };
  }
};

/**
 * Cancel registration
 */
export const cancelRegistration = async (userId, eventId, eventType) => {
  try {
    const collectionName = eventType === 'workshop' ? 'workshopRegistrations' : 'funEventRegistrations';
    
    const q = query(
      collection(db, collectionName),
      where('userId', '==', userId),
      where('eventId', '==', eventId)
    );

    const querySnapshot = await getDocs(q);
    
    if (querySnapshot.empty) {
      throw new Error('Registration not found');
    }

    // Delete the registration
    await deleteDoc(querySnapshot.docs[0].ref);
    invalidateUserRegistrationCache(userId);
    
    return { 
      success: true,
      message: 'Registration cancelled successfully'
    };
  } catch (error) {
    console.error('Error cancelling registration:', error);
    throw new Error(error.message || 'Failed to cancel registration');
  }
};

/**
 * Get all registrations for an event (Admin)
 */
export const getEventRegistrations = async (eventId, eventType) => {
  try {
    const collectionName = eventType === 'workshop' ? 'workshopRegistrations' : 'funEventRegistrations';
    
    const q = query(
      collection(db, collectionName),
      where('eventId', '==', eventId)
    );

    const querySnapshot = await getDocs(q);
    const registrations = querySnapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data(),
      registeredAt: doc.data().registeredAt?.toDate?.() || doc.data().registeredAt
    }));

    return registrations;
  } catch (error) {
    console.error('Error getting event registrations:', error);
    throw new Error('Failed to get event registrations');
  }
};

/**
 * Get registration count for an event
 */
export const getRegistrationCount = async (eventId, eventType) => {
  try {
    const collectionName = eventType === 'workshop' ? 'workshopRegistrations' : 'funEventRegistrations';
    
    const q = query(
      collection(db, collectionName),
      where('eventId', '==', eventId)
    );

    const querySnapshot = await getDocs(q);
    return querySnapshot.size;
  } catch (error) {
    console.error('Error getting registration count:', error);
    return 0;
  }
};
