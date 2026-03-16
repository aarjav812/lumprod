import { db } from '../firebaseDb';
import { 
  collection, 
  doc, 
  addDoc, 
  getDoc, 
  getDocs, 
  updateDoc, 
  deleteDoc, 
  query,
  where,
  serverTimestamp,
  increment
} from 'firebase/firestore';

const EVENTS_CACHE_TTL_MS = 60 * 1000;
let eventsCache = null;
let eventsCacheAt = 0;
let inFlightEventsPromise = null;

const normalizeDateFields = (record) => ({
  ...record,
  dateTime: record.dateTime?.toDate?.() || record.dateTime,
  endDateTime: record.endDateTime?.toDate?.() || record.endDateTime,
  createdAt: record.createdAt?.toDate?.() || record.createdAt,
});

const sortEvents = (events) => {
  const next = [...events];
  next.sort((a, b) => {
    const aDate = a.dateTime ? new Date(a.dateTime) : (a.createdAt ? new Date(a.createdAt) : new Date(0));
    const bDate = b.dateTime ? new Date(b.dateTime) : (b.createdAt ? new Date(b.createdAt) : new Date(0));
    return aDate - bDate;
  });
  return next;
};

const isEventsCacheFresh = () => eventsCache && Date.now() - eventsCacheAt < EVENTS_CACHE_TTL_MS;

const invalidateEventsCache = () => {
  eventsCache = null;
  eventsCacheAt = 0;
  inFlightEventsPromise = null;
};

const fetchAllEventsFromFirestore = async () => {
  const querySnapshot = await getDocs(collection(db, 'events'));
  const events = [];

  querySnapshot.forEach((docItem) => {
    events.push(
      normalizeDateFields({
        id: docItem.id,
        ...docItem.data(),
      })
    );
  });

  eventsCache = sortEvents(events);
  eventsCacheAt = Date.now();
  return eventsCache;
};

const getAllEventsCached = async ({ forceRefresh = false } = {}) => {
  if (!forceRefresh && isEventsCacheFresh()) return eventsCache;
  if (!forceRefresh && inFlightEventsPromise) return inFlightEventsPromise;

  inFlightEventsPromise = fetchAllEventsFromFirestore().finally(() => {
    inFlightEventsPromise = null;
  });

  return inFlightEventsPromise;
};

/**
 * Event Service
 * Handles all event-related operations
 */

// Generate event ID from event name and category
const generateEventId = (eventName, category) => {
  const nameSlug = eventName
    .toLowerCase()
    .replace(/\s+/g, '_')
    .replace(/[^a-z0-9_]/g, '');
  
  const categorySlug = category
    .toLowerCase()
    .replace(/\s+/g, '_')
    .replace(/[^a-z0-9_]/g, '');
  
  return `${nameSlug}_${categorySlug}_${Date.now().toString().slice(-6)}`;
};

/**
 * Create a new event (Admin only)
 */
export const createEvent = async (eventData) => {
  try {
    const eventId = generateEventId(eventData.eventName, eventData.category);
    
    const event = {
      eventId,
      category: eventData.category,
      eventType: eventData.eventType || '',
      funPhase: eventData.funPhase || '',
      eventName: eventData.eventName,
      tagline: eventData.tagline || '',
      regFees: Number(eventData.regFees) || 0,
      duration: eventData.duration || '',
      eligibility: eventData.eligibility || '',
      genres: Array.isArray(eventData.genres) ? eventData.genres : [],
      dateTime: eventData.dateTime,
      endDateTime: eventData.endDateTime || null,
      location: eventData.location || '',
      briefDescription: eventData.briefDescription || '',
      image: eventData.image || '',
      pdfLink: eventData.pdfLink || '',
      contactInfo: eventData.contactInfo || '',
      defaultKey: eventData.defaultKey || '',
      seededFrom: eventData.seededFrom || '',
      isTeamEvent: Boolean(eventData.isTeamEvent),
      minTeamMembers: Number(eventData.minTeamMembers) || 1,
      maxTeamMembers: Number(eventData.maxTeamMembers) || 1,
      teamLimit: Number(eventData.teamLimit) || 0,
      currentTeams: 0,
      createdAt: serverTimestamp(),
      createdBy: eventData.createdBy || '',
    };

    const docRef = await addDoc(collection(db, 'events'), event);
    invalidateEventsCache();
    return { success: true, id: docRef.id, eventId };
  } catch (error) {
    console.error('Error creating event:', error);
    throw new Error(`Failed to create event: ${error.message}`);
  }
};

/**
 * Get all events
 */
export const getAllEvents = async (filters = {}) => {
  try {
    const events = await getAllEventsCached({ forceRefresh: Boolean(filters.forceRefresh) });

    let filteredEvents = events;
    if (filters.category) {
      filteredEvents = events.filter((event) => event.category === filters.category);
    }

    return sortEvents(filteredEvents);
  } catch (error) {
    console.error('Error getting events:', error);
    throw new Error(`Failed to get events: ${error.message}`);
  }
};

/**
 * Get single event by ID
 */
export const getEventById = async (eventId) => {
  try {
    const cached = await getAllEventsCached();
    const localMatch = cached.find((event) => event.id === eventId || event.eventId === eventId);
    if (localMatch) return localMatch;

    // First try to find by eventId field
    const q = query(collection(db, 'events'), where('eventId', '==', eventId));
    const querySnapshot = await getDocs(q);
    
    if (!querySnapshot.empty) {
      const doc = querySnapshot.docs[0];
      return {
        id: doc.id,
        ...normalizeDateFields(doc.data()),
      };
    }

    // If not found, try by document ID
    const docRef = doc(db, 'events', eventId);
    const docSnap = await getDoc(docRef);

    if (docSnap.exists()) {
      return {
        id: docSnap.id,
        ...normalizeDateFields(docSnap.data()),
      };
    }

    return null;
  } catch (error) {
    console.error('Error getting event:', error);
    throw new Error(`Failed to get event: ${error.message}`);
  }
};

/**
 * Update event (Admin only)
 */
export const updateEvent = async (docId, eventData) => {
  try {
    const eventRef = doc(db, 'events', docId);
    
    const updateData = {
      ...eventData,
      updatedAt: serverTimestamp(),
    };

    await updateDoc(eventRef, updateData);
    invalidateEventsCache();
    return { success: true };
  } catch (error) {
    console.error('Error updating event:', error);
    throw new Error(`Failed to update event: ${error.message}`);
  }
};

/**
 * Delete event (Admin only)
 */
export const deleteEvent = async (docId) => {
  try {
    await deleteDoc(doc(db, 'events', docId));
    invalidateEventsCache();
    return { success: true };
  } catch (error) {
    console.error('Error deleting event:', error);
    throw new Error(`Failed to delete event: ${error.message}`);
  }
};

/**
 * Increment team count for event
 */
export const incrementEventTeamCount = async (docId) => {
  try {
    const eventRef = doc(db, 'events', docId);
    await updateDoc(eventRef, {
      currentTeams: increment(1)
    });
    return { success: true };
  } catch (error) {
    console.error('Error incrementing team count:', error);
    throw new Error(`Failed to increment team count: ${error.message}`);
  }
};

/**
 * Decrement team count for event
 */
export const decrementEventTeamCount = async (docId) => {
  try {
    const eventRef = doc(db, 'events', docId);
    await updateDoc(eventRef, {
      currentTeams: increment(-1)
    });
    return { success: true };
  } catch (error) {
    console.error('Error decrementing team count:', error);
    throw new Error(`Failed to decrement team count: ${error.message}`);
  }
};

/**
 * Check if event has reached team limit
 */
export const isEventFull = async (docId) => {
  try {
    const event = await getEventById(docId);
    if (!event) return false;
    
    if (event.teamLimit === 0) return false; // No limit
    return event.currentTeams >= event.teamLimit;
  } catch (error) {
    console.error('Error checking event capacity:', error);
    return false;
  }
};
