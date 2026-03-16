

const schedule = {
  day1: {
    date: 'Friday, March 20, 2026',
    theme: 'The First Spark',
    focus: 'Inauguration, Regional Identity, and Internal Challenge Launch',
    badge: 'day1',
    events: [
      { time: '09:00 AM', name: 'Focus Desk', type: 'Registration & Kit Distribution', venue: 'Main Foyer', icon: 'REG' },
      { time: '10:30 AM', name: 'The First Light', type: 'Opening Ceremony & Theme Reveal', venue: 'Auditorium', icon: 'OPEN' },
      { time: '12:00 PM', name: 'Lumiere Sprint Kickoff', type: '48-Hour Challenge Topic Release', venue: 'Auditorium', icon: 'FILM' },
      { time: '02:00 PM', name: 'Screening: The Northern Ray', type: 'Regional Film Showcase + Q&A', venue: 'Auditorium', icon: 'SHOW' },
      { time: '02:30 PM', name: 'Workshop: Aperture Lab', type: 'Cinematography Masterclass', venue: 'Seminar Hall', icon: 'LAB' },
      { time: '04:30 PM', name: 'Panel: Illuminate', type: 'Discussion: "Voices of the North"', venue: 'Auditorium', icon: 'TALK' },
      { time: '06:30 PM', name: 'Under the Stars', type: 'Open Air Cinema Night', venue: 'Amphitheatre', icon: 'NIGHT' },
    ],
  },
  day2: {
    date: 'Saturday, March 21, 2026',
    theme: 'The Spectrum',
    focus: 'National Competitions, Technical Workshops, and Networking',
    badge: 'day2',
    events: [
      { time: '10:00 AM', name: 'Screening: Prism', type: 'National Student Shorts Competition', venue: 'Auditorium', icon: 'FILM' },
      { time: '11:00 AM', name: 'Workshop: Script & Shadow', type: 'Screenwriting Lab', venue: 'Seminar Hall', icon: 'WRITE' },
      { time: '02:30 PM', name: 'Workshop: Splice', type: 'The Art of Editing (Premiere/DaVinci)', venue: 'Computer Lab', icon: 'EDIT' },
      { time: '04:30 PM', name: 'Focus Circle', type: 'Creators Roundtable (Networking)', venue: 'Foyer', icon: 'MEET' },
      { time: '06:30 PM', name: 'Rhythm & Light', type: 'Cultural Evening & Folk Performance', venue: 'Auditorium', icon: 'CULT' },
    ],
  },
  day3: {
    date: 'Sunday, March 22, 2026',
    theme: 'The Finale',
    focus: 'Submission of Internal Films, Career Guidance, and Awards',
    badge: 'day3',
    events: [
      { time: '10:00 AM', name: 'Sprint Submission', type: 'Deadline for Lumiere Sprint', venue: 'Desk/Online', icon: 'DUE' },
      { time: '11:00 AM', name: 'Screening: Sprint Top 10', type: 'Best of 48-Hour Challenge', venue: 'Auditorium', icon: 'FILM' },
      { time: '11:30 AM', name: 'Workshop: Chroma', type: 'Design for Cinema (Posters/VFX)', venue: 'Seminar Hall', icon: 'DESIGN' },
      { time: '02:00 PM', name: 'Talk: Projection Path', type: 'Industry Career Keynote', venue: 'Auditorium', icon: 'TALK' },
      { time: '03:30 PM', name: 'Jury Focus', type: 'Closed Door Deliberation', venue: 'Conference Room', icon: 'JURY' },
      { time: '05:30 PM', name: 'The Luminous Gala', type: 'Awards Night & Closing Ceremony', venue: 'Auditorium', icon: 'AWARD' },
    ],
  },
};

const workshops = [
  { name: 'Aperture Lab', focus: 'Cinematography Masterclass', day: 'Day 1' },
  { name: 'Script & Shadow', focus: 'Screenwriting Lab', day: 'Day 2' },
  { name: 'Splice', focus: 'Editing with Premiere/DaVinci', day: 'Day 2' },
  { name: 'Chroma', focus: 'Design for Cinema (Posters/VFX)', day: 'Day 3' },
];

export default function Schedule() {
  return (
    <div className="page">
      <div className="container">
        <div className="page-header">
          <h1 className="page-title">
            <span className="gradient-text">Event Schedule</span>
          </h1>
          <p style={{ color: 'var(--text-secondary)', marginTop: '0.5rem' }}>
            Three days of screenings, workshops, panels, and the ultimate awards ceremony. March 20-22, 2026.
          </p>
        </div>

        {/* Quick Info */}
        <div className="info-grid" style={{ marginBottom: '2rem' }}>
          <div className="info-card" style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
            <span style={{ fontSize: '0.8rem', letterSpacing: '0.12em', textTransform: 'uppercase' }}>Date</span>
            <div>
              <div style={{ fontWeight: '600' }}>3 Days</div>
              <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>March 20-22, 2026</div>
            </div>
          </div>
          <div className="info-card" style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
            <span style={{ fontSize: '0.8rem', letterSpacing: '0.12em', textTransform: 'uppercase' }}>Venue</span>
            <div>
              <div style={{ fontWeight: '600' }}>PEC Chandigarh</div>
              <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>Multiple Venues</div>
            </div>
          </div>
          <div className="info-card" style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
            <span style={{ fontSize: '0.8rem', letterSpacing: '0.12em', textTransform: 'uppercase' }}>Workshops</span>
            <div>
              <div style={{ fontWeight: '600' }}>4 Workshops</div>
              <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>Industry-led Sessions</div>
            </div>
          </div>
          <div className="info-card" style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
            <span style={{ fontSize: '0.8rem', letterSpacing: '0.12em', textTransform: 'uppercase' }}>Finale</span>
            <div>
              <div style={{ fontWeight: '600' }}>Awards Gala</div>
              <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>Day 3 Evening</div>
            </div>
          </div>
        </div>

        {/* Day 1 */}
        <div className="timeline-section">
          <div className="day-header">
            <div className={`day-badge ${schedule.day1.badge}`}>D1</div>
            <div className="day-info">
              <h3>{schedule.day1.date}</h3>
              <p>{schedule.day1.theme} — {schedule.day1.focus}</p>
            </div>
          </div>
          <div className="timeline-card">
            {schedule.day1.events.map((event, idx) => (
              <div key={idx} className="timeline-event">
                <div className="event-time">{event.time}</div>
                <div className="event-icon">{event.icon}</div>
                <div className="event-details">
                  <div className="event-name">{event.name}</div>
                  <div className="event-type">{event.type}</div>
                </div>
                <div className="event-venue">{event.venue}</div>
              </div>
            ))}
          </div>
        </div>

        {/* Day 2 */}
        <div className="timeline-section">
          <div className="day-header">
            <div className={`day-badge ${schedule.day2.badge}`}>D2</div>
            <div className="day-info">
              <h3>{schedule.day2.date}</h3>
              <p style={{ color: '#a78bfa' }}>{schedule.day2.theme} — {schedule.day2.focus}</p>
            </div>
          </div>
          <div className="timeline-card">
            {schedule.day2.events.map((event, idx) => (
              <div key={idx} className="timeline-event">
                <div className="event-time">{event.time}</div>
                <div className="event-icon">{event.icon}</div>
                <div className="event-details">
                  <div className="event-name">{event.name}</div>
                  <div className="event-type">{event.type}</div>
                </div>
                <div className="event-venue">{event.venue}</div>
              </div>
            ))}
          </div>
        </div>

        {/* Day 3 */}
        <div className="timeline-section">
          <div className="day-header">
            <div className={`day-badge ${schedule.day3.badge}`}>D3</div>
            <div className="day-info">
              <h3>{schedule.day3.date}</h3>
              <p style={{ color: '#10b981' }}>{schedule.day3.theme} — {schedule.day3.focus}</p>
            </div>
          </div>
          <div className="timeline-card">
            {schedule.day3.events.map((event, idx) => (
              <div key={idx} className="timeline-event">
                <div className="event-time">{event.time}</div>
                <div className="event-icon">{event.icon}</div>
                <div className="event-details">
                  <div className="event-name">{event.name}</div>
                  <div className="event-type">{event.type}</div>
                </div>
                <div className="event-venue">{event.venue}</div>
              </div>
            ))}
          </div>
        </div>

        {/* Workshops */}
        <section style={{ marginTop: '2rem' }}>
          <h2 className="section-title" style={{ marginBottom: '1rem' }}>Featured Workshops</h2>
          <div className="category-grid" style={{ gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))' }}>
            {workshops.map((ws, i) => (
              <div key={i} className="card">
                <div style={{ fontSize: '0.75rem', color: '#a78bfa', marginBottom: '0.5rem' }}>{ws.day}</div>
                <h3 style={{ marginBottom: '0.25rem' }}>{ws.name}</h3>
                <p style={{ color: 'var(--text-secondary)', fontSize: '0.875rem' }}>{ws.focus}</p>
              </div>
            ))}
          </div>
        </section>
      </div>
    </div>
  );
}
