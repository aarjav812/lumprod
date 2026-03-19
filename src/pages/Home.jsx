import { Link } from "react-router-dom";
import { useEffect, useRef, useState } from "react";
import { Camera, Calendar, ChevronDown, Instagram, Layers, Linkedin, MapPin, Monitor } from "lucide-react";
import "./Home.css";

const FESTIVAL_START_TIME = new Date("2026-04-10T18:00:00+05:30").getTime();

const getCountdown = () => {
  const delta = FESTIVAL_START_TIME - Date.now();

  if (delta <= 0) {
    return { live: true, days: "00", hours: "00", minutes: "00", seconds: "00" };
  }

  const days = Math.floor(delta / (1000 * 60 * 60 * 24));
  const hours = Math.floor((delta / (1000 * 60 * 60)) % 24);
  const minutes = Math.floor((delta / (1000 * 60)) % 60);
  const seconds = Math.floor((delta / 1000) % 60);

  return {
    live: false,
    days: String(days).padStart(2, "0"),
    hours: String(hours).padStart(2, "0"),
    minutes: String(minutes).padStart(2, "0"),
    seconds: String(seconds).padStart(2, "0"),
  };
};

const categories = [
  { count: "", label: "3", name: "DAYS" },
  { count: "", label: "15", name: "EVENTS" },
  { count: "", label: "1.2L", name: "PRIZE POOL" },
  { count: "", label: "100+", name: "ENTRIES" },
];

const values = [
  {
    icon: Camera,
    title: "Cinematic Integrity",
    description:
      "Preserving the grit and depth of visual storytelling in a digital-first world.",
  },
  {
    icon: Layers,
    title: "Visual Narrative",
    description:
      "Championing stories that challenge perspective and leave lasting impact.",
  },
  {
    icon: Monitor,
    title: "Global Reach",
    description:
      "Connecting filmmakers and audiences through a shared cinematic language.",
  },
];

const leadership = [
  {
    initials: "AC",
    role: "The Secretary",
    name: "Ayush Chauhan",
    instagram: "https://www.instagram.com/ayushchauhan_485/",
    linkedin: "https://www.linkedin.com/in/ayush485/",
  },
  {
    initials: "HK",
    role: "Joint Secretary",
    name: "Hitesh Kochar",
    instagram: "https://www.instagram.com/kochar_hitesh/",
    linkedin: "https://www.linkedin.com/in/hitesh-kochar-738251257/",
  },
];

const showcases = [
  {
    title: "Midnight Drift",
    subtitle: "Official Selection",
    thumbnail: "/events/undermaintenance.png",
    youtube: "https://www.youtube.com/watch?v=swvJ8KKStyo",
    description:
      "A moody city-side visual narrative exploring momentum, isolation, and the quiet pulse of a sleepless night.",
    large: true,
  },
  {
    title: "The Trap",
    subtitle: "Experimental",
    thumbnail: "/events/trap.png",
    youtube: "https://youtu.be/tBZ_kc32UVw",
    description:
      "In the Fast Moving World populated by innumerable individuals all working towards fulfilling their Dreams...",
  },
];

const getYouTubeId = (url) => {
  if (!url) return "";

  const shortMatch = url.match(/youtu\.be\/([a-zA-Z0-9_-]{11})/);
  if (shortMatch) return shortMatch[1];

  const longMatch = url.match(/[?&]v=([a-zA-Z0-9_-]{11})/);
  if (longMatch) return longMatch[1];

  return "";
};

const getYouTubePreviewUrl = (url) => {
  const videoId = getYouTubeId(url);
  if (!videoId) return "";

  const params = new URLSearchParams({
    autoplay: "1",
    mute: "1",
    controls: "0",
    rel: "0",
    modestbranding: "1",
    playsinline: "1",
  });

  return `https://www.youtube.com/embed/${videoId}?${params.toString()}`;
};

export default function Home() {
  const homeRef = useRef(null);
  const [countdown, setCountdown] = useState(getCountdown);
  const [activePreview, setActivePreview] = useState("");
  const [hoveredShowcase, setHoveredShowcase] = useState("");
  const [showScrollHint, setShowScrollHint] = useState(true);

  useEffect(() => {
    window.scrollTo({ top: 0, left: 0, behavior: "auto" });
  }, []);

  useEffect(() => {
    const homeElement = homeRef.current;
    if (!homeElement) return;

    const setGlowPosition = (x, y) => {
      homeElement.style.setProperty("--hm-mx", `${x}px`);
      homeElement.style.setProperty("--hm-my", `${y}px`);
    };

    const handleMouseMove = (event) => {
      setGlowPosition(event.clientX, event.clientY);
    };

    const resetGlow = () => {
      setGlowPosition(window.innerWidth * 0.5, window.innerHeight * 0.35);
    };

    resetGlow();
    window.addEventListener("mousemove", handleMouseMove, { passive: true });
    window.addEventListener("blur", resetGlow);

    return () => {
      window.removeEventListener("mousemove", handleMouseMove);
      window.removeEventListener("blur", resetGlow);
    };
  }, []);

  useEffect(() => {
    const timer = window.setInterval(() => {
      setCountdown(getCountdown());
    }, 1000);

    return () => {
      window.clearInterval(timer);
    };
  }, []);

  useEffect(() => {
    const hideHint = () => {
      setShowScrollHint(false);
    };

    if (window.scrollY > 8) {
      hideHint();
      return;
    }

    const onScroll = () => {
      if (window.scrollY > 8) {
        hideHint();
      }
    };

    window.addEventListener("scroll", onScroll, { passive: true });
    window.addEventListener("wheel", hideHint, { passive: true });
    window.addEventListener("touchstart", hideHint, { passive: true });
    window.addEventListener("keydown", hideHint);

    return () => {
      window.removeEventListener("scroll", onScroll);
      window.removeEventListener("wheel", hideHint);
      window.removeEventListener("touchstart", hideHint);
      window.removeEventListener("keydown", hideHint);
    };
  }, []);

  const handleScrollHintClick = () => {
    setShowScrollHint(false);
    window.scrollTo({ top: window.innerHeight * 0.82, behavior: "smooth" });
  };

  return (
    <main ref={homeRef} className="hm-home-page">
      <section className="hm-hero" id="top">
        <div className="hm-hero-overlay" aria-hidden="true" />
        <div className="hm-hero-content">
          <p className="hm-eyebrow hm-hero-pretitle">Punjab Engineering College • PDC Presents</p>
          <img src="/logo-text.png" alt="Lumiere" className="hm-hero-logo" />
          <p className="hm-hero-subtitle">film festival</p><div className="hm-hero-timer" aria-live="polite">
            {countdown.live ? (
              <span className="hm-hero-live">Live Now</span>
            ) : (
              <>
                <span className="hm-hero-timer-block">{countdown.days}</span>
                <span className="hm-hero-timer-block">{countdown.hours}</span>
                <span className="hm-hero-timer-block">{countdown.minutes}</span>
                <span className="hm-hero-timer-block">{countdown.seconds}</span>
              </>
            )}
          </div>
          <p className="hm-hero-description">
            The definitive gathering of cinematic visionaries. Explore the
            boundaries of visual storytelling through short films, workshops,
            and the legendary Design Showdown.
          </p>
          <div className="hm-hero-meta" aria-label="Festival date and venue">
            <span className="hm-hero-meta-item">
              <Calendar size={18} strokeWidth={1.8} aria-hidden="true" />
              <span>April 10 to 12, 2026</span>
            </span>
            <span className="hm-hero-meta-divider" aria-hidden="true">•</span>
            <span className="hm-hero-meta-item">
              <MapPin size={18} strokeWidth={1.8} aria-hidden="true" />
              <span>PEC, Chandigarh</span>
            </span>
          </div>
          <div className="hm-hero-actions">
            <Link to="/categories" className="hm-btn hm-btn-primary">
              Register
            </Link>
            <Link to="/about" className="hm-btn hm-btn-secondary">
              Explore Festival
            </Link>
          </div>
        </div>
        {showScrollHint && (
          <button
            type="button"
            className="hm-scroll-hint"
            onClick={handleScrollHintClick}
            aria-label="Scroll down"
          >
            <span>Scroll</span>
            <ChevronDown size={17} strokeWidth={2} aria-hidden="true" />
          </button>
        )}
      </section>

      <section className="hm-section hm-section-dark">
        <div className="hm-container hm-grid hm-categories-grid">
          {categories.map((cat) => (
            <article key={cat.name} className="hm-category-card">
              <p className={`hm-eyebrow ${cat.highlight ? "hm-accent" : ""}`}>
                {cat.label}
              </p>
              <h2>{cat.name}</h2>
            </article>
          ))}
        </div>
      </section>

      <section className="hm-section">
        <div className="hm-container hm-about-grid">
          <div>
            <p className="hm-eyebrow">PDC Legacy</p>
            <h2 className="hm-section-title">
              THE<br />
              PROJECTION<br />
              <span className="hm-title-secondary">& DESIGN</span><br />
              <span className="hm-title-secondary">CLUB</span>
            </h2>
          </div>
          <div className="hm-about-copy">
            <p>
              Lumiere is the flagship celebration of fresh cinematic talent at
              PEC. Under the guidance of the Secretariat, we nurture the next
              generation of visual architects.
            </p>
            {leadership.map((member) => (
              <div key={member.name} className="hm-person-card">
                <div className="hm-person-content">
                  <span>{member.initials}</span>
                  <div>
                    <p className="hm-eyebrow">{member.role}</p>
                    <strong>{member.name}</strong>
                  </div>
                </div>

                <div className="hm-person-socials" aria-label={`${member.name} social links`}>
                  <a
                    href={member.instagram}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="hm-person-social-link"
                    aria-label={`${member.name} Instagram`}
                  >
                    <Instagram size={14} strokeWidth={2} aria-hidden="true" />
                  </a>
                  <a
                    href={member.linkedin}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="hm-person-social-link"
                    aria-label={`${member.name} LinkedIn`}
                  >
                    <Linkedin size={14} strokeWidth={2} aria-hidden="true" />
                  </a>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="hm-section hm-section-dark">
        <div className="hm-container hm-grid hm-values-grid">
          {values.map((value) => (
            <article key={value.title} className="hm-value-card">
              <div className="hm-value-icon" aria-hidden="true">
                <value.icon className="hm-icon" size={20} strokeWidth={1.5} />
              </div>
              <h3>{value.title}</h3>
              <p>{value.description}</p>
            </article>
          ))}
        </div>
      </section>

      <section id="premiere" className="hm-section hm-section-dark">
        <div className="hm-container">
          <h2 className="hm-section-title">
            Premiere
            <br />
            Showcases
          </h2>

          <div className="hm-grid hm-showcase-grid">
            {showcases.map((showcase) => {
              const previewUrl = getYouTubePreviewUrl(showcase.youtube);
              const isPreviewActive = activePreview === showcase.title;
              const isExpanded = hoveredShowcase
                ? hoveredShowcase === showcase.title
                : Boolean(showcase.large);

              return (
                <a
                  key={showcase.title}
                  href={showcase.youtube}
                  target="_blank"
                  rel="noopener noreferrer"
                  className={`hm-showcase-link ${isExpanded ? "hm-showcase-expanded" : "hm-showcase-compact"}`}
                >
                  <article
                    className="hm-showcase-card"
                    onMouseEnter={() => {
                      setHoveredShowcase(showcase.title);
                      if (previewUrl) {
                        setActivePreview(showcase.title);
                      }
                    }}
                    onMouseLeave={() => {
                      setHoveredShowcase("");
                      setActivePreview((current) => (current === showcase.title ? "" : current));
                    }}
                  >
                    <img
                      src={showcase.thumbnail}
                      alt={showcase.title}
                      className="hm-showcase-thumb"
                    />

                    {isPreviewActive && previewUrl && (
                      <iframe
                        src={previewUrl}
                        title={`${showcase.title} preview`}
                        className="hm-showcase-video hm-showcase-iframe"
                        loading="lazy"
                        allow="autoplay; encrypted-media; picture-in-picture"
                        referrerPolicy="strict-origin-when-cross-origin"
                      />
                    )}

                    <div className="hm-showcase-overlay">
                      <p className="hm-eyebrow">{showcase.subtitle}</p>
                      <h3>{showcase.title}</h3>

                      {showcase.description && (
                        <p className="hm-showcase-desc">
                          {showcase.description}
                          <span className="hm-see-more"> See more</span>
                        </p>
                      )}
                    </div>
                  </article>
                </a>
              );
            })}
          </div>

          <div className="hm-bottom-cta">
            <Link
              to="/categories"
              className="hm-btn hm-btn-primary"
            >
              Join Lumiere 2026
            </Link>
          </div>
        </div>
      </section>
    </main>
  );
}
