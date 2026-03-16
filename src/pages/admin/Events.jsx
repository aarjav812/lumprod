import { useEffect, useMemo, useState } from 'react';
import AdminNavbar from '../../components/admin/AdminNavbar';
import { db } from '../../firebaseDb';
import { collection, getDocs } from 'firebase/firestore';
import { useAdmin } from '../../contexts/AdminContext';
import './AdminCommon.css';
import './Events.css';

const WORKSHOP_KEYS = ['aperture-lab', 'script-shadow', 'splice', 'chroma'];
const FUN_KEYS = [
  'tote-bag-designing',
  'scriptwriting-competition',
  'under-the-stars',
  'open-mic',
  'face-painting',
  'photo-walks',
];

const normalize = (value) =>
  String(value || '')
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, '-');

const inferEventType = (event) => {
  const explicit = normalize(event.eventType);
  if (explicit === 'competition' || explicit === 'workshop' || explicit === 'fun') {
    return explicit;
  }

  const category = normalize(event.category);
  if (WORKSHOP_KEYS.some((key) => category.includes(key))) return 'workshop';
  if (FUN_KEYS.some((key) => category.includes(key))) return 'fun';
  return 'competition';
};

const buildEventKeys = (event) => {
  const values = [event.id, event.eventId, event.category, event.eventName];
  return new Set(values.map(normalize).filter(Boolean));
};

const getDateLabel = (date) => {
  if (!date) return 'N/A';
  const parsed = date instanceof Date ? date : new Date(date);
  if (Number.isNaN(parsed.getTime())) return 'N/A';
  return parsed.toLocaleDateString('en-IN', {
    day: '2-digit',
    month: 'short',
    year: 'numeric',
  });
};

const findManagedEvent = (managedEvents, tokens, preferredType) => {
  const normalizedTokens = tokens.map(normalize).filter(Boolean);
  if (normalizedTokens.length === 0) return null;

  const candidateEvents = preferredType
    ? managedEvents.filter((event) => event.eventType === preferredType)
    : managedEvents;

  for (const token of normalizedTokens) {
    const match = candidateEvents.find((event) => event.keySet.has(token));
    if (match) return match;
  }

  return null;
};

const createUnmappedBucket = (label, eventType) => ({
  id: `unmapped-${eventType}-${normalize(label || 'misc')}`,
  eventName: label || 'Unmapped Event',
  category: label || 'Unmapped Event',
  eventType,
  registrationCount: 0,
  breakdown: {
    competition: 0,
    workshop: 0,
    fun: 0,
  },
  registrations: [],
  keySet: new Set([normalize(label)]),
  isUnmapped: true,
});

export default function Events() {
  const [events, setEvents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedEvent, setSelectedEvent] = useState(null);
  const [showModal, setShowModal] = useState(false);
  const _adminCtx = useAdmin();

  useEffect(() => {
    loadRegistrationsByEvent();
  }, []);

  const loadRegistrationsByEvent = async () => {
    setLoading(true);
    try {
      const [eventsSnap, filmSnap, workshopSnap, funSnap] = await Promise.all([
        getDocs(collection(db, 'events')),
        getDocs(collection(db, 'lumiere_submissions')),
        getDocs(collection(db, 'workshopRegistrations')),
        getDocs(collection(db, 'funEventRegistrations')),
      ]);

      const managedEvents = eventsSnap.docs.map((docSnap) => {
        const data = docSnap.data();
        const dateTime = data.dateTime?.toDate?.() || data.dateTime || null;

        return {
          id: docSnap.id,
          eventId: data.eventId || '',
          eventName: data.eventName || 'Untitled Event',
          category: data.category || 'uncategorized',
          eventType: inferEventType(data),
          dateTime,
          registrationCount: 0,
          breakdown: {
            competition: 0,
            workshop: 0,
            fun: 0,
          },
          registrations: [],
          keySet: buildEventKeys({ id: docSnap.id, ...data }),
          isUnmapped: false,
        };
      });

      const unmatched = new Map();
      const attachRegistration = (eventBucket, regType, registrationData) => {
        eventBucket.registrationCount += 1;
        eventBucket.breakdown[regType] += 1;
        eventBucket.registrations.push(registrationData);
      };

      filmSnap.forEach((docSnap) => {
        const sub = docSnap.data();
        const tokens = [sub.category, sub.categoryName, sub.eventName];
        const matched = findManagedEvent(managedEvents, tokens, 'competition');

        const registration = {
          id: docSnap.id,
          type: 'competition',
          title: sub.title || 'Untitled film',
          personName: sub.directorName || 'Unknown director',
          personEmail: sub.directorEmail || sub.userEmail || 'N/A',
          createdAt: sub.createdAt?.toDate?.() || null,
          status: sub.paymentStatus || 'pending',
          fee: Number(sub.fee || 0),
          detail: sub.submissionId || '',
        };

        if (matched) {
          attachRegistration(matched, 'competition', registration);
        } else {
          const label = sub.categoryName || sub.category || 'Unknown competition';
          const key = `competition-${normalize(label)}`;
          if (!unmatched.has(key)) unmatched.set(key, createUnmappedBucket(label, 'competition'));
          attachRegistration(unmatched.get(key), 'competition', registration);
        }
      });

      workshopSnap.forEach((docSnap) => {
        const reg = docSnap.data();
        const tokens = [reg.eventId, reg.eventName];
        const matched = findManagedEvent(managedEvents, tokens, 'workshop');

        const registration = {
          id: docSnap.id,
          type: 'workshop',
          title: reg.eventName || reg.eventId || 'Workshop',
          personName: reg.userName || 'Unknown participant',
          personEmail: reg.userEmail || 'N/A',
          createdAt: reg.registeredAt?.toDate?.() || null,
          status: reg.status || 'registered',
          fee: 0,
          detail: '',
        };

        if (matched) {
          attachRegistration(matched, 'workshop', registration);
        } else {
          const label = reg.eventName || reg.eventId || 'Unknown workshop';
          const key = `workshop-${normalize(label)}`;
          if (!unmatched.has(key)) unmatched.set(key, createUnmappedBucket(label, 'workshop'));
          attachRegistration(unmatched.get(key), 'workshop', registration);
        }
      });

      funSnap.forEach((docSnap) => {
        const reg = docSnap.data();
        const tokens = [reg.eventId, reg.eventName];
        const matched = findManagedEvent(managedEvents, tokens, 'fun');

        const registration = {
          id: docSnap.id,
          type: 'fun',
          title: reg.eventName || reg.eventId || 'Fun event',
          personName: reg.userName || 'Unknown participant',
          personEmail: reg.userEmail || 'N/A',
          createdAt: reg.registeredAt?.toDate?.() || null,
          status: reg.status || 'registered',
          fee: 0,
          detail: '',
        };

        if (matched) {
          attachRegistration(matched, 'fun', registration);
        } else {
          const label = reg.eventName || reg.eventId || 'Unknown fun event';
          const key = `fun-${normalize(label)}`;
          if (!unmatched.has(key)) unmatched.set(key, createUnmappedBucket(label, 'fun'));
          attachRegistration(unmatched.get(key), 'fun', registration);
        }
      });

      const allEvents = [...managedEvents, ...Array.from(unmatched.values())];
      allEvents.sort((a, b) => {
        if (b.registrationCount !== a.registrationCount) return b.registrationCount - a.registrationCount;
        return a.eventName.localeCompare(b.eventName);
      });

      setEvents(allEvents);
    } catch (error) {
      console.error('Error loading registration analytics:', error);
      alert(`Failed to load registrations: ${error.message}`);
    } finally {
      setLoading(false);
    }
  };

  const filteredEvents = useMemo(() => {
    if (!searchTerm.trim()) return events;

    const term = searchTerm.toLowerCase();
    return events.filter((event) => {
      const inEvent = event.eventName.toLowerCase().includes(term) || event.category.toLowerCase().includes(term);
      const inRegistrations = event.registrations.some((registration) =>
        registration.title.toLowerCase().includes(term) ||
        registration.personName.toLowerCase().includes(term) ||
        registration.personEmail.toLowerCase().includes(term)
      );
      return inEvent || inRegistrations;
    });
  }, [events, searchTerm]);

  const totals = useMemo(() => {
    return events.reduce(
      (acc, event) => {
        acc.total += event.registrationCount;
        acc.competition += event.breakdown.competition;
        acc.workshop += event.breakdown.workshop;
        acc.fun += event.breakdown.fun;
        return acc;
      },
      { total: 0, competition: 0, workshop: 0, fun: 0 }
    );
  }, [events]);

  const handleViewEvent = (event) => {
    setSelectedEvent(event);
    setShowModal(true);
  };

  if (loading) {
    return (
      <>
        <AdminNavbar />
        <div className="admin-page">
          <div className="loading">Loading registrations...</div>
        </div>
      </>
    );
  }

  return (
    <>
      <AdminNavbar />
      <div className="admin-page">
        <div className="admin-header">
          <h1>Registrations</h1>
          <p>Track registrations per event and the overall totals.</p>
        </div>

        <div className="admin-content">
          <div className="search-filter">
            <input
              type="text"
              placeholder="Search by event, participant, or title..."
              value={searchTerm}
              onChange={(event) => setSearchTerm(event.target.value)}
              className="search-input"
            />
          </div>

          <div className="stats-grid">
            <div className="stat-card">
              <div className="stat-value">{events.length}</div>
              <div className="stat-label">Tracked Events</div>
            </div>
            <div className="stat-card">
              <div className="stat-value">{totals.total}</div>
              <div className="stat-label">Total Registrations</div>
            </div>
            <div className="stat-card">
              <div className="stat-value">{totals.competition}</div>
              <div className="stat-label">Competition</div>
            </div>
            <div className="stat-card">
              <div className="stat-value">{totals.workshop + totals.fun}</div>
              <div className="stat-label">Workshop + Fun</div>
            </div>
          </div>

          {filteredEvents.length === 0 ? (
            <div className="empty-state">
              <p>No registrations found</p>
            </div>
          ) : (
            <div className="events-grid">
              {filteredEvents.map((event) => (
                <article key={event.id} className="event-card">
                  <div className="event-header">
                    <h3>{event.eventName}</h3>
                    <span className="submission-count">{event.registrationCount}</span>
                  </div>

                  <div className="event-meta-block">
                    <div className="event-meta-line">
                      <span className="event-type-chip">{event.eventType}</span>
                      <span className="event-category-text">{event.category}</span>
                    </div>
                    <div className="event-date-text">{getDateLabel(event.dateTime)}</div>
                  </div>

                  <button onClick={() => handleViewEvent(event)} className="btn-view-event">
                    View Registrations
                  </button>
                </article>
              ))}
            </div>
          )}
        </div>
      </div>

      {showModal && selectedEvent && (
        <div className="modal-overlay" onClick={() => setShowModal(false)}>
          <div className="modal-content modal-large" onClick={(event) => event.stopPropagation()}>
            <div className="modal-header">
              <h2>{selectedEvent.eventName}</h2>
              <button className="modal-close" onClick={() => setShowModal(false)}>Close</button>
            </div>

            <div className="modal-body">
              <div className="detail-group">
                <label>Overview</label>
                <div className="overview-stats">
                  <div className="overview-item">
                    <span className="label">Total Registrations</span>
                    <span className="value">{selectedEvent.registrationCount}</span>
                  </div>
                  <div className="overview-item">
                    <span className="label">Competition</span>
                    <span className="value">{selectedEvent.breakdown.competition}</span>
                  </div>
                  <div className="overview-item">
                    <span className="label">Workshop</span>
                    <span className="value">{selectedEvent.breakdown.workshop}</span>
                  </div>
                  <div className="overview-item">
                    <span className="label">Fun</span>
                    <span className="value">{selectedEvent.breakdown.fun}</span>
                  </div>
                </div>
              </div>

              <div className="detail-group">
                <label>Registration List</label>
                <div className="submissions-list">
                  {selectedEvent.registrations.length === 0 ? (
                    <div className="submission-item">
                      <div className="submission-info">
                        <h4>No registrations yet</h4>
                        <p className="director">This event currently has no registrations.</p>
                      </div>
                    </div>
                  ) : (
                    selectedEvent.registrations.map((registration, index) => (
                      <div key={`${registration.id}-${index}`} className="submission-item">
                        <div className="submission-info">
                          <h4>{registration.title}</h4>
                          <p className="director">{registration.personName}</p>
                          <p className="email">{registration.personEmail}</p>
                          <p className="team-info">Registered: {getDateLabel(registration.createdAt)}</p>
                        </div>
                        <div className="submission-meta">
                          <span className={`status-badge status-${registration.status || 'pending'}`}>
                            {registration.status || 'pending'}
                          </span>
                          <span className="fee">₹{registration.fee || 0}</span>
                        </div>
                      </div>
                    ))
                  )}
                </div>
              </div>
            </div>

            <div className="modal-footer">
              <button className="btn-close" onClick={() => setShowModal(false)}>
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
