import { useEffect, useMemo, useState } from 'react';
import AdminNavbar from '../../components/admin/AdminNavbar';
import {
  createEvent,
  deleteEvent,
  getAllEvents,
  updateEvent,
} from '../../services/eventService';
import { getImageUrlCandidates, toDirectImageUrl } from '../../utils/imageUrl';
import { useAdmin } from '../../contexts/AdminContext';
import './AdminCommon.css';
import './ManageEvents.css';

const EVENT_TYPE_OPTIONS = [
  { id: 'competition', label: 'Competition' },
  { id: 'workshop', label: 'Workshop' },
  { id: 'fun', label: 'Fun Event' },
];

const FUN_PHASE_OPTIONS = [
  { id: 'pre-fest', label: 'Pre Fest' },
  { id: 'fest', label: 'Fest' },
];

const CATEGORY_BY_TYPE = {
  competition: [
    { id: 'lumiere-sprint', label: 'Lumiere Sprint', defaultFee: 150 },
    { id: 'northern-ray', label: 'The Northern Ray', defaultFee: 150 },
    { id: 'prism-showcase', label: 'Prism Showcase', defaultFee: 150 },
    { id: 'vertical-ray', label: 'Vertical Ray', defaultFee: 100 },
    { id: 'verite', label: 'Verite', defaultFee: 100 },
  ],
  workshop: [
    { id: 'aperture-lab', label: 'Aperture Lab', defaultFee: 0 },
    { id: 'splice', label: 'Splice', defaultFee: 0 },
    { id: 'script-shadow', label: 'Script & Shadow', defaultFee: 0 },
    { id: 'chroma', label: 'Chroma', defaultFee: 0 },
  ],
  fun: [
    { id: 'tote-bag-designing', label: 'Tote Bag Designing', defaultFee: 0 },
    { id: 'scriptwriting-competition', label: 'Scriptwriting Competition', defaultFee: 0 },
    { id: 'under-the-stars', label: 'Under the Stars', defaultFee: 0 },
    { id: 'open-mic', label: 'Open Mic', defaultFee: 0 },
    { id: 'face-painting', label: 'Face Painting', defaultFee: 0 },
    { id: 'photo-walks', label: 'Photo Walks', defaultFee: 0 },
  ],
};

const DEFAULT_MANAGED_EVENTS = [
  {
    eventType: 'competition',
    category: 'lumiere-sprint',
    eventName: 'Lumiere Sprint',
    tagline: '48-Hour Challenge',
    briefDescription: 'A flash of creativity - high intensity filmmaking.',
    regFees: 150,
    duration: '3-7 min',
    eligibility: 'Open to all',
    genres: ['Prompt-based', 'Any Genre'],
    image: '/events/lumiere_sprint.png',
    pdfLink: 'https://drive.google.com/file/d/1A7cn99y7l6Wo5q9_wxCuRXM48YdvL6Wa/view?usp=sharing',
  },
  {
    eventType: 'competition',
    category: 'northern-ray',
    eventName: 'The Northern Ray',
    tagline: 'Regional Shorts',
    briefDescription: 'Highlighting the soil and soul of the region. Regional narratives, folk adaptations, social realism, and rural/urban conflict.',
    regFees: 150,
    duration: '5-20 min',
    eligibility: 'Students/Youth from Punjab, Chandigarh, Haryana, HP',
    genres: ['Regional Narratives', 'Folk Adaptations', 'Social Realism', 'Rural/Urban Conflict'],
    image: '/events/northern_ray.png',
    pdfLink: 'https://drive.google.com/file/d/1E8YBEAbqiLD-aGhG1icJoDWZiaTYwOFA/view?usp=sharing',
  },
  {
    eventType: 'competition',
    category: 'prism-showcase',
    eventName: 'Prism Showcase',
    tagline: 'National Student Cinema',
    briefDescription: 'A spectrum of stories from across the nation refracting through one screen.',
    regFees: 150,
    duration: '5-15 min',
    eligibility: 'Students from any recognized Indian institution',
    genres: ['Drama', 'Thriller', 'Sci-Fi', 'Comedy'],
    image: '/events/prism.png',
    pdfLink: 'https://drive.google.com/file/d/1_CGElgr901oDoX-R-S2p-HzAmsgSEEaa/view?usp=sharing',
  },
  {
    eventType: 'competition',
    category: 'vertical-ray',
    eventName: 'Vertical Ray',
    tagline: 'Mobile Storytelling',
    briefDescription: 'Cinema for the modern mobile era. Micro-stories and visual poems.',
    regFees: 100,
    duration: 'Max 60 sec',
    eligibility: 'Open to all',
    genres: ['Micro-stories', 'Visual Poems', 'Comedy'],
    image: '/events/vertical_ray.png',
    pdfLink: 'https://drive.google.com/file/d/18u9BLwIVfDDAonR3V62G0-JXvEkw3EJW/view?usp=sharing',
  },
  {
    eventType: 'competition',
    category: 'verite',
    eventName: 'Verite',
    tagline: 'Non-Fiction/Documentary',
    briefDescription: 'Cinema Verite style, truthful, unscripted, and impactful.',
    regFees: 100,
    duration: '8-20 min',
    eligibility: 'Students from any recognized Indian institution',
    genres: ['Social Impact', 'Environmental', 'Biography'],
    image: '/events/verite.png',
    pdfLink: 'https://drive.google.com/file/d/1iXxMapG1H-WJSs-keWxiYBcrtJwqz0Bh/view?usp=sharing',
  },
  {
    eventType: 'workshop',
    category: 'aperture-lab',
    eventName: 'Cinematography Masterclass',
    briefDescription: 'Camera techniques, lighting, composition and visual storytelling essentials used in professional filmmaking.',
    regFees: 0,
    genres: ['Lighting', 'Composition', 'Camera Movement'],
    image: '/events/aperture_lab.png',
  },
  {
    eventType: 'workshop',
    category: 'splice',
    eventName: 'The Art of Editing',
    briefDescription: 'Premiere Pro and DaVinci Resolve fundamentals covering workflow, pacing, transitions and color correction.',
    regFees: 0,
    genres: ['Editing Workflow', 'Transitions', 'Pacing', 'Color Correction'],
    image: '/events/slice.png',
  },
  {
    eventType: 'workshop',
    category: 'script-shadow',
    eventName: 'Screenwriting Workshop',
    briefDescription: 'Story structure, character development, dialogue writing and script-to-screen fundamentals.',
    regFees: 0,
    genres: ['Story Structure', 'Characters', 'Dialogue', 'Screenplay'],
    image: '/events/script_and_shadow.png',
  },
  {
    eventType: 'workshop',
    category: 'chroma',
    eventName: 'Design for Cinema',
    briefDescription: 'Poster design, cinematic branding, VFX basics and visual identity creation for films.',
    regFees: 0,
    genres: ['Poster Design', 'Branding', 'VFX', 'Visual Aesthetics'],
    image: '/events/chroma.png',
  },
  {
    eventType: 'fun',
    category: 'tote-bag-designing',
    funPhase: 'pre-fest',
    eventName: 'Tote Bag Designing',
    briefDescription: 'Creative tote customization session using paints, textures, and handcrafted visual storytelling.',
    regFees: 0,
    image: '/events/pdccreativespace.png',
  },
  {
    eventType: 'fun',
    category: 'scriptwriting-competition',
    funPhase: 'pre-fest',
    eventName: 'Scriptwriting Competition',
    briefDescription: 'Compete with original scripts, sharp scene writing, and narrative concepts built for screen.',
    regFees: 0,
    image: '/events/script_and_shadow.png',
  },
  {
    eventType: 'fun',
    category: 'under-the-stars',
    funPhase: 'pre-fest',
    eventName: 'Under the Stars',
    briefDescription: 'Outdoor screening experience with music and food.',
    regFees: 0,
    image: '/events/under_the_star.png',
  },
  {
    eventType: 'fun',
    category: 'open-mic',
    funPhase: 'fest',
    eventName: 'Open Mic',
    briefDescription: 'Music, poetry and spontaneous performances.',
    regFees: 0,
    image: '/events/open_mic.png',
  },
  {
    eventType: 'fun',
    category: 'face-painting',
    funPhase: 'fest',
    eventName: 'Face Painting',
    briefDescription: 'Creative expression zone with artistic face art.',
    regFees: 0,
    image: '/events/face_painting.png',
  },
  {
    eventType: 'fun',
    category: 'photo-walks',
    funPhase: 'fest',
    eventName: 'Photo Walks',
    briefDescription: 'Campus photography explorations with creators.',
    regFees: 0,
    image: '/events/photo-walks.jpeg',
  },
];

const EMPTY_FORM = {
  eventType: 'competition',
  category: '',
  customCategory: '',
  funPhase: 'pre-fest',
  eventName: '',
  tagline: '',
  regFees: '150',
  duration: '',
  eligibility: '',
  genresText: '',
  dateTime: '',
  endDateTime: '',
  location: '',
  briefDescription: '',
  image: '',
  pdfLink: '',
  contactInfo: '',
  isTeamEvent: false,
  minTeamMembers: 1,
  maxTeamMembers: 1,
  teamLimit: 0,
};

const normalize = (value) =>
  String(value || '')
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, '-');

const LEGACY_PRE_FEST_KEYS = new Set([
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

const inferTypeFromEvent = (event) => {
  if (event.eventType) return event.eventType;
  const category = normalize(event.category);
  if (['aperture-lab', 'script-shadow', 'splice', 'chroma'].some((token) => category.includes(token))) return 'workshop';
  if (['tote-bag-designing', 'scriptwriting-competition', 'under-the-stars', 'open-mic', 'face-painting', 'photo-walks'].some((token) => category.includes(token))) return 'fun';
  return 'competition';
};

const toDateTimeLocal = (value) => {
  if (!value) return '';
  const date = value instanceof Date ? value : new Date(value);
  if (Number.isNaN(date.getTime())) return '';
  return new Date(date.getTime() - date.getTimezoneOffset() * 60000).toISOString().slice(0, 16);
};

const toGenresArray = (genresText) =>
  String(genresText || '')
    .split(',')
    .map((item) => item.trim())
    .filter(Boolean);

export default function ManageEvents() {
  const { admin } = useAdmin();
  const [events, setEvents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editingEvent, setEditingEvent] = useState(null);
  const [formData, setFormData] = useState(EMPTY_FORM);

  const categoryOptions = useMemo(() => CATEGORY_BY_TYPE[formData.eventType] || [], [formData.eventType]);

  useEffect(() => {
    loadEvents();
  }, []);

  const bootstrapDefaultEvents = async (existingEvents) => {
    const defaultsByKey = new Map(
      DEFAULT_MANAGED_EVENTS.map((event) => [normalize(event.category), event])
    );

    const existingByDefaultKey = new Map();
    existingEvents.forEach((event) => {
      const key = normalize(event.defaultKey || event.category);
      if (defaultsByKey.has(key) && !existingByDefaultKey.has(key)) {
        existingByDefaultKey.set(key, event);
      }
    });

    // Migrate legacy seeded events to include immutable defaultKey.
    for (const [defaultKey, existingEvent] of existingByDefaultKey.entries()) {
      const defaultEvent = defaultsByKey.get(defaultKey);
      const updates = {};

      if (!existingEvent.defaultKey) {
        updates.defaultKey = defaultKey;
        updates.seededFrom = 'default-catalog';
      }

      if (
        defaultEvent?.eventType === 'fun' &&
        defaultEvent.funPhase &&
        !normalizeFunPhase(existingEvent.funPhase)
      ) {
        updates.funPhase = defaultEvent.funPhase;
      }

      if (Object.keys(updates).length > 0) {
        await updateEvent(existingEvent.id, updates);
      }
    }

    for (const [defaultKey, event] of defaultsByKey.entries()) {
      if (existingByDefaultKey.has(defaultKey)) continue;

      await createEvent({
        ...event,
        defaultKey,
        seededFrom: 'default-catalog',
        dateTime: new Date(),
        endDateTime: null,
        location: event.eventType === 'competition' ? 'Main Auditorium' : 'Campus Venue',
        contactInfo: '',
        isTeamEvent: false,
        minTeamMembers: 1,
        maxTeamMembers: 1,
        teamLimit: 0,
        createdBy: admin?.email || '',
      });
    }
  };

  const loadEvents = async () => {
    try {
      const data = await getAllEvents();
      await bootstrapDefaultEvents(data);
      const updated = await getAllEvents();
      setEvents(updated);
    } catch (error) {
      console.error('Error loading events:', error);
      alert('Failed to load events');
    } finally {
      setLoading(false);
    }
  };

  const openCreateDialog = () => {
    setEditingEvent(null);
    setFormData(EMPTY_FORM);
    setDialogOpen(true);
  };

  const openEditDialog = (event) => {
    const eventType = inferTypeFromEvent(event);
    const knownCategory = (CATEGORY_BY_TYPE[eventType] || []).find((option) => option.id === event.category);

    setEditingEvent(event);
    setFormData({
      eventType,
      category: knownCategory ? event.category : 'custom',
      customCategory: knownCategory ? '' : (event.category || ''),
      funPhase:
        normalizeFunPhase(event.funPhase) ||
        (LEGACY_PRE_FEST_KEYS.has(normalize(event.category)) ? 'pre-fest' : 'fest'),
      eventName: event.eventName || '',
      tagline: event.tagline || '',
      regFees: String(event.regFees ?? 0),
      duration: event.duration || '',
      eligibility: event.eligibility || '',
      genresText: Array.isArray(event.genres) ? event.genres.join(', ') : '',
      dateTime: toDateTimeLocal(event.dateTime),
      endDateTime: toDateTimeLocal(event.endDateTime),
      location: event.location || '',
      briefDescription: event.briefDescription || '',
      image: event.image || '',
      pdfLink: event.pdfLink || '',
      contactInfo: event.contactInfo || '',
      isTeamEvent: Boolean(event.isTeamEvent),
      minTeamMembers: Number(event.minTeamMembers || 1),
      maxTeamMembers: Number(event.maxTeamMembers || 1),
      teamLimit: Number(event.teamLimit || 0),
    });
    setDialogOpen(true);
  };

  const closeDialog = () => {
    if (submitting) return;
    setDialogOpen(false);
    setEditingEvent(null);
    setFormData(EMPTY_FORM);
  };

  const handleChange = (event) => {
    const { name, value, type, checked } = event.target;

    if (name === 'eventType') {
      const firstOption = CATEGORY_BY_TYPE[value]?.[0];
      const defaultFee = firstOption ? firstOption.defaultFee : Number(formData.regFees || 0);
      setFormData((prev) => ({
        ...prev,
        eventType: value,
        category: '',
        customCategory: '',
        funPhase: value === 'fun' ? (prev.funPhase || 'pre-fest') : 'pre-fest',
        regFees: String(Number.isFinite(defaultFee) ? defaultFee : 0),
      }));
      return;
    }

    if (name === 'category') {
      const matched = categoryOptions.find((option) => option.id === value);
      const nextFee = formData.eventType === 'competition'
        ? (matched?.defaultFee ?? Number(formData.regFees || 0))
        : Number(formData.regFees || 0);
      setFormData((prev) => ({
        ...prev,
        category: value,
        regFees: String(Number.isFinite(nextFee) ? nextFee : 0),
      }));
      return;
    }

    setFormData((prev) => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value,
    }));
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    setSubmitting(true);

    try {
      const finalCategory = formData.category === 'custom' ? formData.customCategory.trim() : formData.category;
      if (!finalCategory) throw new Error('Please select or enter a category.');

      const imageUrl = toDirectImageUrl(formData.image);

      const fee = Number(formData.regFees || 0);

      const payload = {
        category: finalCategory,
        eventType: formData.eventType,
        funPhase: formData.eventType === 'fun' ? normalizeFunPhase(formData.funPhase) || 'pre-fest' : '',
        eventName: formData.eventName.trim(),
        tagline: formData.tagline.trim(),
        regFees: Number.isFinite(fee) ? fee : 0,
        duration: formData.duration.trim(),
        eligibility: formData.eligibility.trim(),
        genres: toGenresArray(formData.genresText),
        dateTime: formData.dateTime ? new Date(formData.dateTime) : null,
        endDateTime: formData.endDateTime ? new Date(formData.endDateTime) : null,
        location: formData.location.trim(),
        briefDescription: formData.briefDescription.trim(),
        image: imageUrl,
        pdfLink: formData.pdfLink.trim(),
        contactInfo: formData.contactInfo.trim(),
        isTeamEvent: formData.isTeamEvent,
        minTeamMembers: Number(formData.minTeamMembers || 1),
        maxTeamMembers: Number(formData.maxTeamMembers || 1),
        teamLimit: Number(formData.teamLimit || 0),
        createdBy: admin?.email || '',
      };

      if (editingEvent) {
        await updateEvent(editingEvent.id, payload);
        alert('Event updated successfully.');
      } else {
        await createEvent(payload);
        alert('Event created successfully.');
      }

      closeDialog();
      await loadEvents();
    } catch (error) {
      console.error('Error saving event:', error);
      alert(error.message || 'Failed to save event');
    } finally {
      setSubmitting(false);
    }
  };

  const handleDelete = async (event) => {
    if (!window.confirm(`Delete event "${event.eventName}"?`)) return;
    try {
      await deleteEvent(event.id);
      await loadEvents();
    } catch (error) {
      console.error('Error deleting event:', error);
      alert('Failed to delete event');
    }
  };

  if (loading) {
    return (
      <>
        <AdminNavbar />
        <div className="admin-page">
          <div className="loading">Loading events...</div>
        </div>
      </>
    );
  }

  return (
    <>
      <AdminNavbar />
      <div className="admin-page admin-events-page">
        <div className="admin-header admin-events-header">
          <div>
            <h1>Manage Events</h1>
            <p>Edit all existing competition, workshop, and fun events. Add new ones from the same dialog.</p>
          </div>
          <button className="btn-primary admin-create-btn" onClick={openCreateDialog}>+ Add Event</button>
        </div>

        <div className="events-list">
          <h2>Event Catalog ({events.length})</h2>
          {events.length === 0 ? (
            <p className="no-data">No events found.</p>
          ) : (
            <div className="events-grid">
              {events.map((event) => (
                <article key={event.id} className="event-card-admin">
                  {event.image && (
                    <div className="event-image">
                      <img
                        src={getImageUrlCandidates(event.image)[0] || ''}
                        alt={event.eventName}
                        data-image-candidate-index="0"
                        onError={(imgEvent) => {
                          const currentIndex = Number(imgEvent.currentTarget.dataset.imageCandidateIndex || '0');
                          const imageCandidates = getImageUrlCandidates(event.image);
                          const nextIndex = currentIndex + 1;
                          if (nextIndex < imageCandidates.length) {
                            imgEvent.currentTarget.dataset.imageCandidateIndex = String(nextIndex);
                            imgEvent.currentTarget.src = imageCandidates[nextIndex];
                            return;
                          }

                          imgEvent.currentTarget.style.display = 'none';
                        }}
                      />
                    </div>
                  )}
                  <div className="event-content">
                    <h3>{event.eventName}</h3>
                    <p className="event-type-chip">{inferTypeFromEvent(event)}</p>
                    <p className="event-category">{event.category}</p>
                    {inferTypeFromEvent(event) === 'fun' && normalizeFunPhase(event.funPhase) && (
                      <p className="event-date">
                        Section: {normalizeFunPhase(event.funPhase) === 'pre-fest' ? 'Pre Fest' : 'Fest'}
                      </p>
                    )}
                    <p className="event-fee">Rs {event.regFees || 0}</p>
                    {event.duration && <p className="event-date">Duration: {event.duration}</p>}
                    {event.eligibility && <p className="event-team">Eligibility: {event.eligibility}</p>}
                  </div>
                  <div className="event-actions">
                    <button className="btn-edit" onClick={() => openEditDialog(event)}>Edit</button>
                    <button className="btn-delete" onClick={() => handleDelete(event)}>Delete</button>
                  </div>
                </article>
              ))}
            </div>
          )}
        </div>
      </div>

      {dialogOpen && (
        <div className="admin-dialog-overlay" role="presentation" onClick={closeDialog}>
          <div className="admin-dialog" role="dialog" aria-modal="true" onClick={(event) => event.stopPropagation()}>
            <div className="admin-dialog-header">
              <h2>{editingEvent ? 'Edit Event' : 'Add Event'}</h2>
              <button className="admin-dialog-close" onClick={closeDialog} aria-label="Close dialog">x</button>
            </div>

            <form onSubmit={handleSubmit} className="event-form">
              <div className="form-row">
                <div className="form-group">
                  <label>Event Type *</label>
                  <select name="eventType" value={formData.eventType} onChange={handleChange} required>
                    {EVENT_TYPE_OPTIONS.map((typeOption) => (
                      <option key={typeOption.id} value={typeOption.id}>{typeOption.label}</option>
                    ))}
                  </select>
                </div>

                <div className="form-group">
                  <label>Category *</label>
                  <select name="category" value={formData.category} onChange={handleChange} required>
                    <option value="">Select category</option>
                    {categoryOptions.map((category) => (
                      <option key={category.id} value={category.id}>{category.label}</option>
                    ))}
                    <option value="custom">Custom Category</option>
                  </select>
                </div>

                {formData.eventType === 'fun' && (
                  <div className="form-group">
                    <label>Fun Event Section *</label>
                    <select name="funPhase" value={formData.funPhase} onChange={handleChange} required>
                      {FUN_PHASE_OPTIONS.map((phase) => (
                        <option key={phase.id} value={phase.id}>{phase.label}</option>
                      ))}
                    </select>
                  </div>
                )}
              </div>

              {formData.category === 'custom' && (
                <div className="form-group">
                  <label>Custom Category Name *</label>
                  <input type="text" name="customCategory" value={formData.customCategory} onChange={handleChange} required />
                </div>
              )}

              <div className="form-row">
                <div className="form-group">
                  <label>Event Name *</label>
                  <input type="text" name="eventName" value={formData.eventName} onChange={handleChange} required />
                </div>
                <div className="form-group">
                  <label>Tagline</label>
                  <input type="text" name="tagline" value={formData.tagline} onChange={handleChange} />
                </div>
              </div>

              <div className="form-row">
                <div className="form-group">
                  <label>Registration Fee (Rs) *</label>
                  <input type="number" name="regFees" value={formData.regFees} onChange={handleChange} min="0" required />
                </div>
                <div className="form-group">
                  <label>Duration</label>
                  <input type="text" name="duration" value={formData.duration} onChange={handleChange} placeholder="e.g., 5-15 min" />
                </div>
              </div>

              <div className="form-row">
                <div className="form-group">
                  <label>Eligibility</label>
                  <input type="text" name="eligibility" value={formData.eligibility} onChange={handleChange} placeholder="e.g., Open to all" />
                </div>
                <div className="form-group">
                  <label>Genres (comma separated)</label>
                  <input type="text" name="genresText" value={formData.genresText} onChange={handleChange} placeholder="Drama, Thriller" />
                </div>
              </div>

              <div className="form-row">
                <div className="form-group">
                  <label>Start Date & Time</label>
                  <input type="datetime-local" name="dateTime" value={formData.dateTime} onChange={handleChange} />
                </div>
                <div className="form-group">
                  <label>End Date & Time</label>
                  <input type="datetime-local" name="endDateTime" value={formData.endDateTime} onChange={handleChange} />
                </div>
              </div>

              <div className="form-group">
                <label>Location</label>
                <input type="text" name="location" value={formData.location} onChange={handleChange} />
              </div>

              <div className="form-group">
                <label>Description</label>
                <textarea name="briefDescription" value={formData.briefDescription} onChange={handleChange} rows={4} />
              </div>

              <div className="form-row">
                <div className="form-group">
                  <label>Contact Info</label>
                  <input type="text" name="contactInfo" value={formData.contactInfo} onChange={handleChange} />
                </div>
                <div className="form-group">
                  <label>Guideline PDF Link</label>
                  <input type="url" name="pdfLink" value={formData.pdfLink} onChange={handleChange} placeholder="https://..." />
                </div>
              </div>

              <div className="form-group">
                <label>Event Image Link (Google Drive or direct URL)</label>
                <input
                  type="url"
                  name="image"
                  value={formData.image}
                  onChange={handleChange}
                  placeholder="https://drive.google.com/file/d/.../view"
                />
                {formData.image && (
                  <div className="current-image">
                    <img
                      src={getImageUrlCandidates(formData.image)[0] || ''}
                      alt="Current"
                      data-image-candidate-index="0"
                      onError={(imgEvent) => {
                        const currentIndex = Number(imgEvent.currentTarget.dataset.imageCandidateIndex || '0');
                        const imageCandidates = getImageUrlCandidates(formData.image);
                        const nextIndex = currentIndex + 1;
                        if (nextIndex < imageCandidates.length) {
                          imgEvent.currentTarget.dataset.imageCandidateIndex = String(nextIndex);
                          imgEvent.currentTarget.src = imageCandidates[nextIndex];
                          return;
                        }

                        imgEvent.currentTarget.style.display = 'none';
                      }}
                    />
                  </div>
                )}
              </div>

              <div className="form-group checkbox-group">
                <label>
                  <input type="checkbox" name="isTeamEvent" checked={formData.isTeamEvent} onChange={handleChange} />
                  <span>This is a team event</span>
                </label>
              </div>

              {formData.isTeamEvent && (
                <div className="form-row">
                  <div className="form-group">
                    <label>Min Team Members</label>
                    <input type="number" name="minTeamMembers" value={formData.minTeamMembers} onChange={handleChange} min="1" />
                  </div>
                  <div className="form-group">
                    <label>Max Team Members</label>
                    <input type="number" name="maxTeamMembers" value={formData.maxTeamMembers} onChange={handleChange} min="1" />
                  </div>
                  <div className="form-group">
                    <label>Team Limit (0 = unlimited)</label>
                    <input type="number" name="teamLimit" value={formData.teamLimit} onChange={handleChange} min="0" />
                  </div>
                </div>
              )}

              <div className="form-actions">
                <button type="button" className="btn-cancel" onClick={closeDialog}>Cancel</button>
                <button type="submit" className="btn-submit" disabled={submitting}>
                  {submitting ? 'Saving...' : editingEvent ? 'Update Event' : 'Create Event'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </>
  );
}
