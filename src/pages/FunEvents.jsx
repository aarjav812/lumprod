import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../AuthContext';
import { getAllEvents, getUserRegistrations, registerForEvent } from '../services';
import { toDirectImageUrl } from '../utils/imageUrl';
import './FunEvents.css';

const DEFAULT_PRE_FEST_EVENTS = [
  {
    id: 'tote-bag-designing',
    categoryKey: 'tote-bag-designing',
    title: 'Tote Bag Designing',
    image: '/events/pdccreativespace.png',
    description:
      'Paint, print, and personalize a festival tote with guided prompts, stencil stations, and texture experiments.',
    vibe: 'Craft + Color',
  },
  {
    id: 'scriptwriting-competition',
    categoryKey: 'scriptwriting-competition',
    title: 'Scriptwriting Competition',
    image: '/events/script_and_shadow.png',
    description:
      'Pitch-ready scenes, strong character arcs, and quick mentor feedback in a writing-first creative sprint.',
    vibe: 'Words + Drama',
  },
  {
    id: 'under-the-stars',
    categoryKey: 'under-the-stars',
    title: 'Under The Stars',
    image: '/events/under_the_star.png',
    description:
      'Late-night picnic blankets, indie film snippets, and a telescope swing-by. Perfect wind-down after the spotlight.',
    vibe: 'Calm + Cosmic',
  },
];

const DEFAULT_FEST_EVENTS = [
  {
    id: 'open-mic',
    categoryKey: 'open-mic',
    title: "Open Mic Afterglow",
    image: "/events/open_mic.png",
    description:
      "Spontaneous stories, slam poetry, and acoustic sets under a warm spotlight. Claim the stage or cheer your crew.",
    vibe: "Chill + Loud",
  },
  {
    id: 'photo-walks',
    categoryKey: 'photo-walks',
    title: "Photo Walks",
    image: "/events/photo-walks.jpeg",
    description:
      "Golden-hour strolls with creative prompts, instant critiques, and a few cinematic surprises tucked along the path.",
    vibe: "Slow + Curious",
  },
  {
    id: 'face-painting',
    categoryKey: 'face-painting',
    title: "Face Painting Carnival",
    image: "/events/face_painting.png",
    description:
      "Neon swirls, metallic accents, and character makeovers. Walk in anonymous, leave as your alter ego.",
    vibe: "Bold + Playful",
  },
];

const PRE_FEST_CATEGORY_KEYS = new Set([
  'tote-bag-designing',
  'scriptwriting-competition',
  'under-the-stars',
]);

const normalizeFunPhase = (value) => {
  const normalized = normalize(value);
  if (normalized === 'pre-fest' || normalized === 'prefest') return 'pre-fest';
  if (normalized === 'fest') return 'fest';
  return '';
};

const normalize = (value) =>
  String(value || '')
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, '-');

const toDate = (value) => {
  if (!value) return null;
  const parsed = value instanceof Date ? value : new Date(value);
  return Number.isNaN(parsed.getTime()) ? null : parsed;
};

const formatDateRange = (startValue, endValue) => {
  const startDate = toDate(startValue);
  const endDate = toDate(endValue);

  if (!startDate && !endDate) return '';

  const formatter = new Intl.DateTimeFormat('en-IN', {
    day: '2-digit',
    month: 'short',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  });

  if (startDate && endDate) {
    return `${formatter.format(startDate)} - ${formatter.format(endDate)}`;
  }

  return formatter.format(startDate || endDate);
};

const toGenres = (value) => {
  if (!value) return [];
  if (Array.isArray(value)) return value.filter(Boolean);
  return String(value)
    .split(',')
    .map((item) => item.trim())
    .filter(Boolean);
};

const getTeamLabel = (event) => {
  if (event.isTeamEvent) {
    const min = Number(event.minTeamMembers || 1);
    const max = Number(event.maxTeamMembers || min);
    const limit = Number(event.teamLimit || 0);
    const limitText = limit > 0 ? `, max ${limit} teams` : '';
    return `${min}-${max} members${limitText}`;
  }
  return '';
};

const withFunDetailDefaults = (event) => {
  const feeValue = Number(event.fee ?? event.regFees ?? 0);
  const isValidFee = Number.isFinite(feeValue) && feeValue > 0;

  return {
    ...event,
    tagline: event.tagline || '',
    vibe: event.vibe || event.tagline || '',
    description: String(event.description || event.briefDescription || '').trim(),
    duration: String(event.duration || '').trim(),
    eligibility: String(event.eligibility || '').trim(),
    genres: toGenres(event.genres),
    fee: isValidFee ? feeValue : 0,
    location: String(event.location || '').trim(),
    scheduleLabel: formatDateRange(event.dateTime, event.endDateTime),
    contactInfo: String(event.contactInfo || '').trim(),
    teamLabel: getTeamLabel(event),
    guidelineLink: event.guidelineLink || event.pdfLink || '',
  };
};

const inferEventType = (event) => {
  if (event.eventType) return event.eventType;
  const category = normalize(event.category);
  if ([
    'tote-bag-designing',
    'scriptwriting-competition',
    'under-the-stars',
    'open-mic',
    'face-painting',
    'photo-walks',
  ].some((token) => category.includes(token))) return 'fun';
  return 'competition';
};

const mapManagedFunEvent = (event) => {
  const categoryKey = normalize(event.category || event.eventId || event.id);

  return withFunDetailDefaults({
    id: categoryKey,
    categoryKey,
    funPhase: normalizeFunPhase(event.funPhase),
    title: event.eventName || 'Untitled Fun Event',
    image: toDirectImageUrl(event.image) || '/events/under_the_star.png',
    description: event.briefDescription || event.description || '',
    vibe: event.tagline || '',
    tagline: event.tagline,
    regFees: event.regFees,
    duration: event.duration,
    eligibility: event.eligibility,
    genres: event.genres,
    location: event.location,
    dateTime: event.dateTime,
    endDateTime: event.endDateTime,
    contactInfo: event.contactInfo,
    guidelineLink: event.pdfLink,
    isTeamEvent: event.isTeamEvent,
    minTeamMembers: event.minTeamMembers,
    maxTeamMembers: event.maxTeamMembers,
    teamLimit: event.teamLimit,
  });
};

function FunCard({ event, index, joined, joining, onJoin }) {
  const handleMove = (e) => {
    const rect = e.currentTarget.getBoundingClientRect();
    const x = ((e.clientX - rect.left) / rect.width) * 100;
    const y = ((e.clientY - rect.top) / rect.height) * 100;
    e.currentTarget.style.setProperty("--mx", `${x}%`);
    e.currentTarget.style.setProperty("--my", `${y}%`);
  };

  const handleLeave = (e) => {
    e.currentTarget.style.removeProperty("--mx");
    e.currentTarget.style.removeProperty("--my");
  };

  const detailItems = [
    event.scheduleLabel ? { label: 'When', value: event.scheduleLabel } : null,
    event.location ? { label: 'Venue', value: event.location } : null,
    event.fee > 0 ? { label: 'Fee', value: `Rs ${event.fee}` } : null,
    event.duration ? { label: 'Duration', value: event.duration } : null,
    event.eligibility ? { label: 'Eligibility', value: event.eligibility } : null,
    event.teamLabel ? { label: 'Team', value: event.teamLabel } : null,
    event.contactInfo ? { label: 'Contact', value: event.contactInfo, wide: true } : null,
  ].filter(Boolean);

  const hasShortDetails = detailItems.length > 0 && detailItems.length <= 2;

  return (
    <article
      className="fe-card"
      onMouseMove={handleMove}
      onMouseLeave={handleLeave}
      role="article"
    >
      <span className="fe-card-index" aria-hidden="true">{String(index + 1).padStart(2, "0")}</span>
      <div className="fe-card-media">
        <img src={event.image} alt={event.title} loading="lazy" />
        {event.vibe && <span className="fe-card-pill">{event.vibe}</span>}
      </div>
      <div className="fe-card-body">
        <h3>{event.title}</h3>
        {event.tagline && <p className="fe-card-tagline">{event.tagline}</p>}
        {event.description && <p>{event.description}</p>}

        {detailItems.length > 0 && (
          <div className={`fe-card-detail-grid ${hasShortDetails ? 'fe-card-detail-grid-compact' : ''}`.trim()}>
            {detailItems.map((detail) => (
              <div
                key={`${event.id}-${detail.label}`}
                className={`fe-detail ${detail.wide ? 'fe-detail-wide' : ''}`.trim()}
              >
                <span>{detail.label}</span>
                <p title={detail.value}>{detail.value}</p>
              </div>
            ))}
          </div>
        )}

        {event.genres.length > 0 && (
          <div className="fe-card-meta">
            {event.genres.map((genre) => (
              <span key={`${event.id}-${genre}`}>{genre}</span>
            ))}
          </div>
        )}

        <div className="fe-card-actions">
          {event.guidelineLink && (
            <button
              type="button"
              className="fe-guideline-btn"
              onClick={() => window.open(event.guidelineLink, '_blank')}
              title="View Guidelines"
            >
              Guidelines
            </button>
          )}

          <button
            type="button"
            className={`fe-join-btn ${joined ? 'registered-btn' : ''}`}
            onClick={() => onJoin(event)}
            disabled={joined || joining}
          >
            {joining ? 'Joining...' : joined ? 'Joined' : 'Join'}
          </button>
        </div>
      </div>
    </article>
  );
}

export default function FunEvents() {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [funSections, setFunSections] = useState({
    preFest: DEFAULT_PRE_FEST_EVENTS.map(withFunDetailDefaults),
    fest: DEFAULT_FEST_EVENTS.map(withFunDetailDefaults),
  });
  const [registeredFunEvents, setRegisteredFunEvents] = useState([]);
  const [loading, setLoading] = useState({});

  useEffect(() => {
    const loadManagedFunEvents = async () => {
      try {
        const events = await getAllEvents();
        const managedFunEvents = events
          .filter((event) => inferEventType(event) === 'fun')
          .map(mapManagedFunEvent);

        if (managedFunEvents.length === 0) return;

        const preFest = managedFunEvents.filter((event) => {
          if (event.funPhase === 'pre-fest') return true;
          if (event.funPhase === 'fest') return false;
          return PRE_FEST_CATEGORY_KEYS.has(event.categoryKey);
        });
        const fest = managedFunEvents.filter((event) => {
          if (event.funPhase === 'fest') return true;
          if (event.funPhase === 'pre-fest') return false;
          return !PRE_FEST_CATEGORY_KEYS.has(event.categoryKey);
        });

        setFunSections({
          preFest: preFest.length ? preFest : DEFAULT_PRE_FEST_EVENTS.map(withFunDetailDefaults),
          fest: fest.length ? fest : DEFAULT_FEST_EVENTS.map(withFunDetailDefaults),
        });
      } catch (error) {
        console.error('Error loading fun events from events collection:', error);
      }
    };

    loadManagedFunEvents();
  }, []);

  useEffect(() => {
    const loadRegistrations = async () => {
      if (user) {
        try {
          const { funEvents } = await getUserRegistrations(user.uid);
          setRegisteredFunEvents(funEvents.map((registration) => registration.eventId));
        } catch (error) {
          console.error('Error loading registrations:', error);
        }
      } else {
        setRegisteredFunEvents([]);
      }
    };

    loadRegistrations();
  }, [user]);

  const isRegistered = (eventId) => registeredFunEvents.includes(eventId);
  const totalEvents = funSections.preFest.length + funSections.fest.length;

  const handleRegister = async (event) => {
    if (!user) {
      alert('Please login to register for events');
      navigate('/login');
      return;
    }

    if (isRegistered(event.id)) {
      return;
    }

    setLoading((prev) => ({ ...prev, [event.id]: true }));

    try {
      await registerForEvent(
        user.uid,
        user.email,
        user.displayName || user.email,
        event.id,
        event.title,
        'fun'
      );

      setRegisteredFunEvents((prev) => [...prev, event.id]);
      alert(`Successfully registered for ${event.title}!`);
    } catch (error) {
      console.error('Registration error:', error);
      alert(error.message || 'Failed to register. Please try again.');
    } finally {
      setLoading((prev) => ({ ...prev, [event.id]: false }));
    }
  };

  return (
    <main className="fe-page">
      <section className="fe-hero">
        <div className="fe-hero-orb" aria-hidden="true" />
        <div className="fe-hero-content">
          <p className="fe-eyebrow">Side quests at Lumiere</p>
          <h1>Fun Events</h1>
          <p className="fe-hero-copy">
            High-energy pit stops inspired by our home page glow. Jump in for playful breaks,
            meet new crews, and keep the festival buzz going between screenings.
          </p>

        </div>
        <div className="fe-hero-stats" aria-hidden="true">
          <div className="fe-stat">
            <span>{String(totalEvents).padStart(2, '0')}</span>
            <p>Signature side events</p>
          </div>
          <div className="fe-stat">
            <span>All</span>
            <p>Open for all</p>
          </div>
          <div className="fe-stat">
            <span>10-12</span>
            <p>April nights</p>
          </div>
        </div>
      </section>

      <section className="fe-section">
        <div className="fe-section-head">
          <div>
            <p className="fe-eyebrow">Before the fest</p>
            <h2>Pre Fest Fun Events</h2>
            <p className="fe-sub">Early creative rounds to warm up teams before the main festival rush.</p>
          </div>
        </div>

        <div className="fe-card-grid">
          {funSections.preFest.map((event, index) => (
            <FunCard
              key={event.id}
              event={event}
              index={index}
              joined={isRegistered(event.id)}
              joining={Boolean(loading[event.id])}
              onJoin={handleRegister}
            />
          ))}
        </div>
      </section>

      <section className="fe-section">
        <div className="fe-section-head">
          <div>
            <p className="fe-eyebrow">Pick your thrill</p>
            <h2>Fest Fun Events</h2>
            <p className="fe-sub">Made to be loud, bright, and social.</p>
          </div>
        </div>

        <div className="fe-card-grid">
          {funSections.fest.map((event, index) => (
            <FunCard
              key={event.id}
              event={event}
              index={index}
              joined={isRegistered(event.id)}
              joining={Boolean(loading[event.id])}
              onJoin={handleRegister}
            />
          ))}
        </div>
      </section>
    </main>
  );
}
