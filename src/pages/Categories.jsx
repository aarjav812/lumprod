import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { getAllEvents } from '../services';
import { toDirectImageUrl } from '../utils/imageUrl';
import './Categories.css';

const DEFAULT_COMPETITION_CATEGORIES = [
  {
    id: 'lumiere-sprint',
    name: 'Lumiere Sprint',
    tagline: '48-Hour Challenge',
    description: 'A flash of creativity - high intensity filmmaking.',
    fee: 150,
    duration: '3-7 min',
    eligibility: 'Open to all',
    genres: ['Prompt-based', 'Any Genre'],
    guidelineLink: 'https://drive.google.com/file/d/1A7cn99y7l6Wo5q9_wxCuRXM48YdvL6Wa/view?usp=sharing',
    image: '/events/lumiere_sprint.png',
  },
  {
    id: 'northern-ray',
    name: 'The Northern Ray',
    tagline: 'Regional Shorts',
    description:
      'Highlighting the soil and soul of the region. Regional narratives, folk adaptations, social realism, and rural/urban conflict.',
    fee: 150,
    duration: '5-20 min',
    eligibility: 'Students/Youth from Punjab, Chandigarh, Haryana, HP',
    genres: ['Regional Narratives', 'Folk Adaptations', 'Social Realism', 'Rural/Urban Conflict'],
    guidelineLink: 'https://drive.google.com/file/d/1E8YBEAbqiLD-aGhG1icJoDWZiaTYwOFA/view?usp=sharing',
    image: '/events/northern_ray.png',
  },
  {
    id: 'prism-showcase',
    name: 'Prism Showcase',
    tagline: 'National Student Cinema',
    description: 'A spectrum of stories from across the nation refracting through one screen.',
    fee: 150,
    duration: '5-15 min',
    eligibility: 'Students from any recognized Indian institution',
    genres: ['Drama', 'Thriller', 'Sci-Fi', 'Comedy'],
    guidelineLink: 'https://drive.google.com/file/d/1_CGElgr901oDoX-R-S2p-HzAmsgSEEaa/view?usp=sharing',
    image: '/events/prism.png',
  },
  {
    id: 'vertical-ray',
    name: 'Vertical Ray',
    tagline: 'Mobile Storytelling',
    description: 'Cinema for the modern mobile era. Micro-stories and visual poems.',
    fee: 100,
    duration: 'Max 60 sec',
    eligibility: 'Open to all',
    genres: ['Micro-stories', 'Visual Poems', 'Comedy'],
    guidelineLink: 'https://drive.google.com/file/d/18u9BLwIVfDDAonR3V62G0-JXvEkw3EJW/view?usp=sharing',
    image: '/events/vertical_ray.png',
  },
  {
    id: 'verite',
    name: 'Verite',
    tagline: 'Non-Fiction/Documentary',
    description: 'Cinema Verite style, truthful, unscripted, and impactful',
    fee: 100,
    duration: '8-20 min',
    eligibility: 'Students from any recognized Indian institution',
    genres: ['Social Impact', 'Environmental', 'Biography'],
    guidelineLink: 'https://drive.google.com/file/d/1iXxMapG1H-WJSs-keWxiYBcrtJwqz0Bh/view?usp=sharing',
    image: '/events/verite.png',
  },
];

const DEFAULT_WORKSHOP_CATEGORIES = [
  {
    id: 'aperture-lab',
    name: 'Cinematography Masterclass',
    description:
      'Camera techniques, lighting, composition and visual storytelling essentials used in professional filmmaking.',
    genres: ['Lighting', 'Composition', 'Camera Movement'],
    image: '/events/aperture_lab.png',
  },
  {
    id: 'splice',
    name: 'The Art of Editing',
    description:
      'Premiere Pro and DaVinci Resolve fundamentals covering workflow, pacing, transitions and color correction.',
    genres: ['Editing Workflow', 'Transitions', 'Pacing', 'Color Correction'],
    image: '/events/slice.png',
  },
  {
    id: 'script-shadow',
    name: 'Screenwriting Workshop',
    description:
      'Story structure, character development, dialogue writing and script-to-screen fundamentals.',
    genres: ['Story Structure', 'Characters', 'Dialogue', 'Screenplay'],
    image: '/events/script_and_shadow.png',
  },
  {
    id: 'chroma',
    name: 'Design for Cinema',
    description:
      'Poster design, cinematic branding, VFX basics and visual identity creation for films.',
    genres: ['Poster Design', 'Branding', 'VFX', 'Visual Aesthetics'],
    image: '/events/chroma.png',
  },
];

const technicalAwards = [
  'Best Director',
  'Best Cinematography',
  'Best Editing',
  'Best Sound Design',
  'Best Screenplay',
  'Audience Aperture Award',
];

const normalize = (value) =>
  String(value || '')
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, '-');

const inferEventType = (event) => {
  if (event.eventType) return event.eventType;
  const category = normalize(event.category);
  if (['aperture-lab', 'script-shadow', 'splice', 'chroma'].some((token) => category.includes(token))) return 'workshop';
  if (['tote-bag-designing', 'scriptwriting-competition', 'under-the-stars', 'open-mic', 'face-painting', 'photo-walks'].some((token) => category.includes(token))) return 'fun';
  return 'competition';
};

const toGenres = (value) => {
  if (!value) return [];
  if (Array.isArray(value)) return value.filter(Boolean);
  return String(value)
    .split(',')
    .map((item) => item.trim())
    .filter(Boolean);
};

const toDate = (value) => {
  if (!value) return null;
  const parsed = value instanceof Date ? value : new Date(value);
  return Number.isNaN(parsed.getTime()) ? null : parsed;
};

const formatDateRange = (startValue, endValue) => {
  const startDate = toDate(startValue);
  const endDate = toDate(endValue);

  if (!startDate && !endDate) return 'To be announced';

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

const getTeamLabel = (event, eventType) => {
  if (event.isTeamEvent) {
    const min = Number(event.minTeamMembers || 1);
    const max = Number(event.maxTeamMembers || min);
    const limit = Number(event.teamLimit || 0);
    const limitText = limit > 0 ? `, max ${limit} teams` : '';
    return `${min}-${max} members${limitText}`;
  }

  if (eventType === 'competition') return 'Solo or team (as rules permit)';
  if (eventType === 'workshop') return 'Individual participation';
  return 'Open participation';
};

const withDetailDefaults = (event, eventType) => {
  const feeValue = Number(event.fee ?? event.regFees ?? 0);

  return {
    ...event,
    tagline:
      event.tagline ||
      (eventType === 'competition'
        ? 'Competition Category'
        : eventType === 'workshop'
          ? 'Skill Workshop'
          : 'Community Event'),
    description: event.description || event.briefDescription || 'Details will be updated soon.',
    duration: event.duration || (eventType === 'competition' ? 'TBA' : 'Session details will be announced'),
    eligibility: event.eligibility || 'Open for all',
    genres: toGenres(event.genres),
    fee: Number.isFinite(feeValue) ? feeValue : 0,
    location: event.location || (eventType === 'competition' ? 'Main Auditorium' : 'Campus Venue'),
    scheduleLabel: formatDateRange(event.dateTime, event.endDateTime),
    contactInfo: event.contactInfo || 'Contact details will be announced shortly.',
    teamLabel: getTeamLabel(event, eventType),
    guidelineLink: event.guidelineLink || event.pdfLink || '',
    image:
      toDirectImageUrl(event.image) ||
      (eventType === 'competition'
        ? '/events/lumiere_sprint.png'
        : eventType === 'workshop'
          ? '/events/aperture_lab.png'
          : '/events/under_the_star.png'),
  };
};

const mapCompetitionEvent = (event) =>
  withDetailDefaults(
    {
      id: event.category || event.eventId || event.id,
      name: event.eventName || event.title || 'Untitled Event',
      tagline: event.tagline,
      description: event.briefDescription || event.description,
      fee: event.regFees,
      duration: event.duration,
      eligibility: event.eligibility,
      genres: event.genres,
      guidelineLink: event.pdfLink || event.guidelineLink,
      image: event.image,
      location: event.location,
      dateTime: event.dateTime,
      endDateTime: event.endDateTime,
      contactInfo: event.contactInfo,
      isTeamEvent: event.isTeamEvent,
      minTeamMembers: event.minTeamMembers,
      maxTeamMembers: event.maxTeamMembers,
      teamLimit: event.teamLimit,
    },
    'competition'
  );

const mapWorkshopEvent = (event) =>
  withDetailDefaults(
    {
      id: event.category || event.eventId || event.id,
      name: event.eventName || event.title || 'Untitled Workshop',
      description: event.briefDescription || event.description,
      genres: event.genres,
      image: event.image,
      fee: event.regFees,
      duration: event.duration,
      eligibility: event.eligibility,
      location: event.location,
      dateTime: event.dateTime,
      endDateTime: event.endDateTime,
      contactInfo: event.contactInfo,
      guidelineLink: event.pdfLink,
      isTeamEvent: event.isTeamEvent,
      minTeamMembers: event.minTeamMembers,
      maxTeamMembers: event.maxTeamMembers,
      teamLimit: event.teamLimit,
    },
    'workshop'
  );

export default function Categories() {
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState('competition');
  const [dbCategories, setDbCategories] = useState({
    competition: [],
    workshop: [],
  });

  useEffect(() => {
    const loadManagedEvents = async () => {
      try {
        const events = await getAllEvents();
        const grouped = {
          competition: [],
          workshop: [],
        };

        events.forEach((event) => {
          const type = inferEventType(event);
          if (type === 'competition') grouped.competition.push(mapCompetitionEvent(event));
          if (type === 'workshop') grouped.workshop.push(mapWorkshopEvent(event));
        });

        setDbCategories(grouped);
      } catch (error) {
        console.error('Error loading categories from events collection:', error);
      }
    };

    loadManagedEvents();
  }, []);

  const getCategories = () => {
    switch (activeTab) {
      case 'workshop': {
        const list = dbCategories.workshop.length ? dbCategories.workshop : DEFAULT_WORKSHOP_CATEGORIES;
        return list.map((event) => withDetailDefaults(event, 'workshop'));
      }
      case 'competition':
      default: {
        const list = dbCategories.competition.length ? dbCategories.competition : DEFAULT_COMPETITION_CATEGORIES;
        return list.map((event) => withDetailDefaults(event, 'competition'));
      }
    }
  };

  const getTitle = () => {
    switch (activeTab) {
      case 'workshop':
        return 'Workshop Categories';
      case 'competition':
      default:
        return 'Competition Categories';
    }
  };

  const getSubtitle = () => {
    switch (activeTab) {
      case 'workshop':
        return 'Enhance your skills with hands-on workshops led by industry experts.';
      case 'competition':
      default:
        return 'Multiple competitive tracks designed to showcase diverse filmmaking talents.';
    }
  };

  const categories = getCategories();

  return (
    <div className="categories-page">
      <div className="categories-hero-stack">
        <p className="categories-eyebrow">Lumiere 2026 Tracks</p>
        <h1 className="categories-hero-title">{getTitle()}</h1>
        <p className="categories-hero-subtitle">{getSubtitle()}</p>
      </div>

      <div className="categories-toggle">
        <button
          className={`toggle-btn ${activeTab === 'competition' ? 'active' : ''}`}
          onClick={() => setActiveTab('competition')}
        >
          Competition
        </button>
        <button
          className={`toggle-btn ${activeTab === 'workshop' ? 'active' : ''}`}
          onClick={() => setActiveTab('workshop')}
        >
          Workshop
        </button>
      </div>

      <div className={`categories-wrapper ${activeTab === 'workshop' ? 'workshop-grid' : ''}`}>
        {categories.map((category) => (
          <div
            key={category.id}
            className={`category-card ${activeTab === 'competition' ? 'competition-card' : 'workshop-card'}`}
          >
            {activeTab === 'competition' && (
              <>
                <div className="category-left">
                  <div
                    className="category-media category-media-competition"
                    style={{ backgroundImage: `url(${category.image})` }}
                    aria-label={`${category.name} visual`}
                  />
                  <div className="category-title-row">
                    <h2>{category.name}</h2>
                  </div>
                  <h3>{category.tagline}</h3>
                  <p className="category-description">{category.description}</p>

                  <div className="genre-list">
                    {category.genres && category.genres.map((genre) => (
                      <span key={`${category.id}-${genre}`}>{genre}</span>
                    ))}
                  </div>
                </div>

                <div className="category-right">
                  <div className="info-block">
                    <div className="info-row">
                      <span>Submission</span>
                      <p>Rs {category.fee}</p>
                    </div>

                    <div className="info-row">
                      <span>Duration</span>
                      <p>{category.duration}</p>
                    </div>

                    <div className="info-row eligibility">
                      <span>Eligibility</span>
                      <p>{category.eligibility}</p>
                    </div>

                    <div className="event-highlights">
                      <div className="event-highlight" title={category.scheduleLabel}>
                        <span>When</span>
                        <p>{category.scheduleLabel}</p>
                      </div>
                      <div className="event-highlight" title={category.location}>
                        <span>Venue</span>
                        <p>{category.location}</p>
                      </div>
                      <div className="event-highlight" title={category.teamLabel}>
                        <span>Team</span>
                        <p>{category.teamLabel}</p>
                      </div>
                      <div className="event-highlight" title={category.contactInfo}>
                        <span>Contact</span>
                        <p>{category.contactInfo}</p>
                      </div>
                    </div>
                  </div>

                  <div className="category-buttons">
                    <button
                      type="button"
                      className="guideline-btn"
                      onClick={() => category.guidelineLink && window.open(category.guidelineLink, '_blank')}
                      disabled={!category.guidelineLink}
                      title={category.guidelineLink ? 'View Guidelines' : 'Guidelines coming soon'}
                    >
                      Guidelines
                    </button>
                    <button
                      type="button"
                      className="submit-btn"
                      onClick={() => navigate('/submit')}
                    >
                      Submit
                    </button>
                  </div>
                </div>
              </>
            )}

            {activeTab === 'workshop' && (
              <div className="card-content-centered">
                <div
                  className="category-media category-media-workshop"
                  style={{ backgroundImage: `url(${category.image})` }}
                  aria-label={`${category.name} visual`}
                />
                <div className="category-title-row">
                  <h2>{category.name}</h2>
                </div>
                <p className="category-description">{category.description}</p>

                <div className="genre-list">
                  {category.genres && category.genres.map((genre) => (
                    <span key={`${category.id}-${genre}`}>{genre}</span>
                  ))}
                </div>

                <div className="event-highlights compact-grid">
                  <div className="event-highlight" title={category.scheduleLabel}>
                    <span>When</span>
                    <p>{category.scheduleLabel}</p>
                  </div>
                  <div className="event-highlight" title={category.location}>
                    <span>Venue</span>
                    <p>{category.location}</p>
                  </div>
                  <div className="event-highlight" title={category.eligibility}>
                    <span>Eligibility</span>
                    <p>{category.eligibility}</p>
                  </div>
                  <div className="event-highlight" title={category.teamLabel}>
                    <span>Team</span>
                    <p>{category.teamLabel}</p>
                  </div>
                  <div className="event-highlight wide" title={category.contactInfo}>
                    <span>Contact</span>
                    <p>{category.contactInfo}</p>
                  </div>
                </div>

                <div className="category-buttons centered">
                  <button
                    type="button"
                    className="submit-btn"
                    onClick={() => navigate('/submit/workshop', {
                      state: {
                        workshop: {
                          id: category.id,
                          name: category.name,
                          type: category.id,
                        },
                      },
                    })}
                  >
                    {category.fee > 0 ? `Apply (Rs ${category.fee})` : 'Apply (Free)'}
                  </button>
                  <button
                    type="button"
                    className="guideline-btn"
                    onClick={() => category.guidelineLink && window.open(category.guidelineLink, '_blank')}
                    disabled={!category.guidelineLink}
                    title={category.guidelineLink ? 'View Guidelines' : 'Guidelines coming soon'}
                  >
                    Guidelines
                  </button>
                </div>
              </div>
            )}

          </div>
        ))}
      </div>

      {activeTab === 'competition' && (
        <section className="awards-section">
          <h2>Technical & Jury Awards</h2>
          <p>In addition to category winners, special recognition awards are given for technical excellence.</p>
          <div className="awards-grid">
            {technicalAwards.map((award) => (
              <span key={award} className="award-pill">
                {award}
              </span>
            ))}
          </div>
        </section>
      )}

      <section className="final-cta" />
    </div>
  );
}
