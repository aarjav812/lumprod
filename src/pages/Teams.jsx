import { useEffect, useState } from 'react';
import { doc, getDoc } from 'firebase/firestore';
import { Instagram, Linkedin, Mail, MapPin, Sparkles } from "lucide-react";
import { Link } from "react-router-dom";
import { db } from '../firebaseDb';
import { getImageUrlCandidates, toDirectImageUrl } from '../utils/imageUrl';
import "./Teams.css";

const committees = [
  "Programming",
  "Production",
  "Hospitality",
  "Sponsorship",
  "Outreach",
  "Marketing",
  "Branding",
  "Design",
  "Content",
  "Social Media",
  "PR & Media",
  "Logistics",
  "Stage & Venue",
  "Documentation",
  "Registration",
];

const DEFAULT_LEADERSHIP = [
  {
    role: "Convener",
    name: "Convener Name",
    committee: "Festival Direction",
    photo: "",
    instagram: "https://www.instagram.com/",
    linkedin: "https://www.linkedin.com/",
  },
  {
    role: "Co-Convener",
    name: "Co-Convener Name",
    committee: "Festival Direction",
    photo: "",
    instagram: "https://www.instagram.com/",
    linkedin: "https://www.linkedin.com/",
  },
];

const buildTier = (roleLabel, namePrefix) =>
  committees.map((committee, index) => ({
    role: roleLabel,
    name: `${namePrefix} ${String(index + 1).padStart(2, "0")}`,
    committee,
    photo: "",
    instagram: "https://www.instagram.com/",
    linkedin: "https://www.linkedin.com/",
  }));

const heads = buildTier('Head', 'Head');
const jointHeads = buildTier('Joint Head', 'Joint Head');
const subHeads = buildTier('Subhead', 'Subhead');

const DEFAULT_DEVELOPERS = [
  {
    role: "Lead Developer",
    name: "Ayush Chauhan",
    committee: "Website Engineering",
    photo: "",
    instagram: "https://www.instagram.com/ayushchauhan_485/",
    linkedin: "https://www.linkedin.com/in/ayush485/",
  },
  {
    role: "Developer",
    name: "Hitesh Kochar",
    committee: "Website Engineering",
    photo: "",
    instagram: "https://www.instagram.com/kochar_hitesh/",
    linkedin: "https://www.linkedin.com/in/hitesh-kochar-738251257/",
  },
];

const DEFAULT_TIERS = [
  {
    eyebrow: "Leadership Tier",
    title: "Heads",
    description: "Primary leads shaping each festival lane, committee, and execution stream.",
    members: heads,
    accent: "gold",
  },
  {
    eyebrow: "Operations Tier",
    title: "Joint Heads",
    description: "Execution anchors supporting committee planning, coordination, and festival flow.",
    members: jointHeads,
    accent: "blue",
  },
  {
    eyebrow: "Crew Tier",
    title: "Subheads",
    description: "The hands-on crew translating direction into detail across the entire event.",
    members: subHeads,
    accent: "neutral",
  },
];

const footerLinks = [
  { to: "/about", label: "About" },
  { to: "/teams", label: "Teams" },
  { to: "/categories", label: "Categories" },
  { to: "/faq", label: "FAQ" },
];

const normalizeMember = (member) => ({
  role: String(member?.role || '').trim(),
  name: String(member?.name || '').trim(),
  committee: String(member?.committee || '').trim(),
  photo: toDirectImageUrl(member?.photo),
  instagram: String(member?.instagram || '').trim(),
  linkedin: String(member?.linkedin || '').trim(),
});

const normalizeTier = (tier) => ({
  eyebrow: String(tier?.eyebrow || '').trim(),
  title: String(tier?.title || '').trim(),
  description: String(tier?.description || '').trim(),
  accent: ['gold', 'blue', 'neutral'].includes(tier?.accent) ? tier.accent : 'neutral',
  members: Array.isArray(tier?.members) ? tier.members.map(normalizeMember) : [],
});

const normalizeTeamContent = (value) => ({
  leadership: Array.isArray(value?.leadership)
    ? value.leadership.map(normalizeMember)
    : DEFAULT_LEADERSHIP,
  tiers: Array.isArray(value?.tiers) ? value.tiers.map(normalizeTier) : DEFAULT_TIERS,
  developers: Array.isArray(value?.developers)
    ? value.developers.map(normalizeMember)
    : DEFAULT_DEVELOPERS,
});

const getFallbackPhoto = (member) => {
  const name = member?.name || 'Lumiere Team';
  const encodedName = encodeURIComponent(name);
  return `https://ui-avatars.com/api/?name=${encodedName}&size=640&background=1b1b20&color=ffffff&bold=true&format=png`;
};

function TeamCard({ member, featured = false, accent = "gold" }) {
  const imageCandidates = getImageUrlCandidates(member.photo);
  const photoSrc = imageCandidates[0] || getFallbackPhoto(member);

  return (
    <article className={`tm-card ${featured ? "tm-card-featured" : ""} tm-card-${accent}`}>
      <div className="tm-card-grid">
        <div className="tm-card-portrait-wrap">
          <img
            src={photoSrc}
            alt={member.name}
            className="tm-card-portrait"
            data-image-candidate-index="0"
            onError={(event) => {
              const currentIndex = Number(event.currentTarget.dataset.imageCandidateIndex || '0');
              const nextIndex = currentIndex + 1;

              if (nextIndex < imageCandidates.length) {
                event.currentTarget.dataset.imageCandidateIndex = String(nextIndex);
                event.currentTarget.src = imageCandidates[nextIndex];
                return;
              }

              event.currentTarget.src = getFallbackPhoto(member);
            }}
          />
        </div>

        <div className="tm-card-copy">
          <p className="tm-card-role">{member.role}</p>
          <h3>{member.name}</h3>
          <p className="tm-card-committee">{member.committee}</p>
        </div>

        <div className="tm-card-socials" aria-label={`${member.name} social links`}>
          <a
            href={member.instagram}
            target="_blank"
            rel="noopener noreferrer"
            className="tm-card-social"
            aria-label={`${member.name} Instagram`}
          >
            <Instagram size={15} strokeWidth={2} aria-hidden="true" />
          </a>
          <a
            href={member.linkedin}
            target="_blank"
            rel="noopener noreferrer"
            className="tm-card-social"
            aria-label={`${member.name} LinkedIn`}
          >
            <Linkedin size={15} strokeWidth={2} aria-hidden="true" />
          </a>
        </div>
      </div>
    </article>
  );
}

export default function Teams() {
  const [teamContent, setTeamContent] = useState({
    leadership: DEFAULT_LEADERSHIP,
    tiers: DEFAULT_TIERS,
    developers: DEFAULT_DEVELOPERS,
  });

  useEffect(() => {
    const loadTeamContent = async () => {
      try {
        const snap = await getDoc(doc(db, 'siteContent', 'teamPage'));
        if (snap.exists()) {
          setTeamContent(normalizeTeamContent(snap.data()));
        }
      } catch (error) {
        console.error('Failed to load team page content:', error);
      }
    };

    loadTeamContent();
  }, []);

  const totalMembers =
    teamContent.leadership.length +
    teamContent.developers.length +
    teamContent.tiers.reduce((sum, tier) => sum + tier.members.length, 0);

  return (
    <main className="teams-page">
      <section className="tm-hero">
        <div className="tm-hero-copy">
          <p className="tm-eyebrow">Lumiere 2026 Team Structure</p>
          <h1>
            The People
            <br />
            Behind The Frame
          </h1>
          <p className="tm-lead">
            A festival this scale is built layer by layer. Explore the hierarchy that
            drives Lumiere, from conveners at the top to the subheads carrying every
            detail to the finish line.
          </p>
        </div>

        <div className="tm-hero-mark" aria-hidden="true">
          <Sparkles size={22} strokeWidth={1.8} />
          <span>Hierarchy</span>
        </div>
      </section>

      <section className="tm-spotlight-wrap">
        <div className="tm-spotlight-header">
          <p className="tm-eyebrow">Top Tier</p>
          <h2>Conveners</h2>
        </div>

        <div className="tm-spotlight-grid">
          {teamContent.leadership.map((member) => (
            <TeamCard key={`${member.role}-${member.name}`} member={member} featured accent="gold" />
          ))}
        </div>
      </section>

      {teamContent.tiers.map((tier) => (
        <section key={tier.title} className="tm-tier-section">
          <div className="tm-tier-header">
            <div>
              <p className="tm-eyebrow">{tier.eyebrow}</p>
              <h2>{tier.title}</h2>
            </div>
            <p>{tier.description}</p>
          </div>

          <div className="tm-tier-grid">
            {tier.members.map((member) => (
              <TeamCard
                key={`${tier.title}-${member.committee}`}
                member={member}
                accent={tier.accent}
              />
            ))}
          </div>
        </section>
      ))}

      <section className="tm-tier-section">
        <div className="tm-tier-header">
          <div>
            <p className="tm-eyebrow">Digital Team</p>
            <h2>Developers</h2>
          </div>
          <p>
            The engineering team responsible for building and maintaining the Lumiere
            website experience across registrations, submissions, and admin operations.
          </p>
        </div>

        <div className="tm-tier-grid">
          {teamContent.developers.map((member) => (
            <TeamCard
              key={`developers-${member.name}`}
              member={member}
              accent="blue"
            />
          ))}
        </div>
      </section>

      <footer className="tm-footer">
        <div className="tm-footer-grid">
          <div className="tm-footer-brand">
            <p className="tm-eyebrow">Lumiere 2026</p>
            <h2>Built By People Who Care About Every Frame.</h2>
            <p>
              From strategy to stagecraft, the Lumiere team is structured to keep the
              festival precise, cinematic, and unforgettable from the first announcement
              to the final screening.
            </p>
          </div>

          <div className="tm-footer-column">
            <p className="tm-footer-label">Explore</p>
            <div className="tm-footer-links">
              {footerLinks.map((link) => (
                <Link key={link.to} to={link.to} className="tm-footer-link">
                  {link.label}
                </Link>
              ))}
            </div>
          </div>

          <div className="tm-footer-column">
            <p className="tm-footer-label">Festival Desk</p>
            <div className="tm-footer-contact-list">
              <a className="tm-footer-contact" href="mailto:lumiere.pec@gmail.com">
                <Mail size={16} strokeWidth={1.8} aria-hidden="true" />
                <span>lumiere.pec@gmail.com</span>
              </a>
              <div className="tm-footer-contact">
                <MapPin size={16} strokeWidth={1.8} aria-hidden="true" />
                <span>Punjab Engineering College, Chandigarh</span>
              </div>
              <a
                className="tm-footer-contact"
                href="https://www.instagram.com/lumiere_pec/"
                target="_blank"
                rel="noopener noreferrer"
              >
                <Instagram size={16} strokeWidth={1.8} aria-hidden="true" />
                <span>@lumiere_pec</span>
              </a>
              <a
                className="tm-footer-contact"
                href="https://www.instagram.com/projectionanddesignclub/"
                target="_blank"
                rel="noopener noreferrer"
              >
                <Instagram size={16} strokeWidth={1.8} aria-hidden="true" />
                <span>@projectionanddesignclub</span>
              </a>
              <a
                className="tm-footer-contact"
                href="https://www.instagram.com/pdc_pec/"
                target="_blank"
                rel="noopener noreferrer"
              >
                <Instagram size={16} strokeWidth={1.8} aria-hidden="true" />
                <span>@pdc_pec</span>
              </a>
            </div>
          </div>
        </div>

        <div className="tm-footer-bottom">
          <p>{totalMembers} total team members powering Lumiere 2026.</p>
          <p>Projection & Design Club, PEC</p>
        </div>
      </footer>
    </main>
  );
}