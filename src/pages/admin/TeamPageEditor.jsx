import { useEffect, useMemo, useState } from 'react';
import { doc, getDoc, serverTimestamp, setDoc } from 'firebase/firestore';
import AdminNavbar from '../../components/admin/AdminNavbar';
import { db } from '../../firebaseDb';
import { useAdmin } from '../../contexts/AdminContext';
import { getImageUrlCandidates, toDirectImageUrl } from '../../utils/imageUrl';
import './AdminCommon.css';
import './TeamPageEditor.css';

const committees = [
  'Programming',
  'Production',
  'Hospitality',
  'Sponsorship',
  'Outreach',
  'Marketing',
  'Branding',
  'Design',
  'Content',
  'Social Media',
  'PR & Media',
  'Logistics',
  'Stage & Venue',
  'Documentation',
  'Registration',
];

const TEAM_EDITOR_DRAFT_KEY = 'lumiere_team_page_editor_draft';

const canUseSessionStorage = () => typeof window !== 'undefined' && Boolean(window.sessionStorage);

const buildTier = (roleLabel, namePrefix) =>
  committees.map((committee, index) => ({
    role: roleLabel,
    name: `${namePrefix} ${String(index + 1).padStart(2, '0')}`,
    committee,
    photo: '',
    instagram: 'https://www.instagram.com/',
    linkedin: 'https://www.linkedin.com/',
  }));

const DEFAULT_CONTENT = {
  leadership: [
    {
      role: 'Convener',
      name: 'Convener Name',
      committee: 'Festival Direction',
      photo: '',
      instagram: 'https://www.instagram.com/',
      linkedin: 'https://www.linkedin.com/',
    },
    {
      role: 'Co-Convener',
      name: 'Co-Convener Name',
      committee: 'Festival Direction',
      photo: '',
      instagram: 'https://www.instagram.com/',
      linkedin: 'https://www.linkedin.com/',
    },
  ],
  tiers: [
    {
      eyebrow: 'Leadership Tier',
      title: 'Heads',
      description: 'Primary leads shaping each festival lane, committee, and execution stream.',
      accent: 'gold',
      members: buildTier('Head', 'Head'),
    },
    {
      eyebrow: 'Operations Tier',
      title: 'Joint Heads',
      description: 'Execution anchors supporting committee planning, coordination, and festival flow.',
      accent: 'blue',
      members: buildTier('Joint Head', 'Joint Head'),
    },
    {
      eyebrow: 'Crew Tier',
      title: 'Subheads',
      description: 'The hands-on crew translating direction into detail across the entire event.',
      accent: 'neutral',
      members: buildTier('Subhead', 'Subhead'),
    },
  ],
  developers: [
    {
      role: 'Lead Developer',
      name: 'Ayush Chauhan',
      committee: 'Website Engineering',
      photo: '',
      instagram: 'https://www.instagram.com/ayushchauhan_485/',
      linkedin: 'https://www.linkedin.com/in/ayush485/',
    },
    {
      role: 'Developer',
      name: 'Hitesh Kochar',
      committee: 'Website Engineering',
      photo: '',
      instagram: 'https://www.instagram.com/kochar_hitesh/',
      linkedin: 'https://www.linkedin.com/in/hitesh-kochar-738251257/',
    },
  ],
};

const emptyMember = () => ({
  role: '',
  name: '',
  committee: '',
  photo: '',
  instagram: 'https://www.instagram.com/',
  linkedin: 'https://www.linkedin.com/',
});

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

const getPreviewFallbackPhoto = (member) => {
  const name = member?.name || 'Lumiere Team';
  const encodedName = encodeURIComponent(name);
  return `https://ui-avatars.com/api/?name=${encodedName}&size=256&background=1b1b20&color=ffffff&bold=true&format=png`;
};

const normalizeContent = (value) => ({
  leadership: Array.isArray(value?.leadership)
    ? value.leadership.map(normalizeMember)
    : DEFAULT_CONTENT.leadership,
  tiers: Array.isArray(value?.tiers) ? value.tiers.map(normalizeTier) : DEFAULT_CONTENT.tiers,
  developers: Array.isArray(value?.developers)
    ? value.developers.map(normalizeMember)
    : DEFAULT_CONTENT.developers,
});

function MemberEditor({
  title,
  members,
  onChange,
  sectionKey,
  compact = false,
}) {
  const updateMember = (index, key, value) => {
    const next = [...members];
    next[index] = { ...next[index], [key]: value };
    onChange(next);
  };

  const addMember = () => onChange([...members, emptyMember()]);
  const removeMember = (index) => onChange(members.filter((_, memberIndex) => memberIndex !== index));

  return (
    <div className="team-editor-card">
      <div className="team-editor-head">
        <h3>{title}</h3>
        <button type="button" className="team-editor-btn" onClick={addMember}>
          + Add Member
        </button>
      </div>

      <div className="team-editor-list">
        {members.map((member, index) => {
          const imageCandidates = getImageUrlCandidates(member.photo);
          const photoSrc = imageCandidates[0] || '';

          return (
            <article key={`${title}-${index}`} className="team-editor-member">
            <div className="team-editor-row">
              <label>
                Role
                <input
                  className="team-editor-input"
                  value={member.role}
                  onChange={(event) => updateMember(index, 'role', event.target.value)}
                />
              </label>
              <label>
                Name
                <input
                  className="team-editor-input"
                  value={member.name}
                  onChange={(event) => updateMember(index, 'name', event.target.value)}
                />
              </label>
              <label>
                Committee
                <input
                  className="team-editor-input"
                  value={member.committee}
                  onChange={(event) => updateMember(index, 'committee', event.target.value)}
                />
              </label>
            </div>

            {!compact && (
              <div className="team-editor-row">
                <label>
                  Photo URL
                  <input
                    className="team-editor-input"
                    value={member.photo}
                    onChange={(event) => updateMember(index, 'photo', event.target.value)}
                  />
                </label>
                <label>
                  Instagram URL
                  <input
                    className="team-editor-input"
                    value={member.instagram}
                    onChange={(event) => updateMember(index, 'instagram', event.target.value)}
                  />
                </label>
                <label>
                  LinkedIn URL
                  <input
                    className="team-editor-input"
                    value={member.linkedin}
                    onChange={(event) => updateMember(index, 'linkedin', event.target.value)}
                  />
                </label>
              </div>
            )}

            {compact && (
              <div className="team-editor-row">
                <label>
                  Photo URL
                  <input
                    className="team-editor-input"
                    value={member.photo}
                    onChange={(event) => updateMember(index, 'photo', event.target.value)}
                  />
                </label>
              </div>
            )}

            <div className="team-editor-photo-tools">
              <div className="team-editor-photo-preview-wrap" aria-hidden="true">
                {photoSrc ? (
                  <img
                    src={photoSrc}
                    alt=""
                    className="team-editor-photo-preview"
                    data-image-candidate-index="0"
                    onError={(event) => {
                      const currentIndex = Number(event.currentTarget.dataset.imageCandidateIndex || '0');
                      const nextIndex = currentIndex + 1;

                      if (nextIndex < imageCandidates.length) {
                        event.currentTarget.dataset.imageCandidateIndex = String(nextIndex);
                        event.currentTarget.src = imageCandidates[nextIndex];
                        return;
                      }

                      if (event.currentTarget.dataset.fallbackApplied === 'true') {
                        event.currentTarget.style.display = 'none';
                        return;
                      }

                      event.currentTarget.dataset.fallbackApplied = 'true';
                      event.currentTarget.src = getPreviewFallbackPhoto(member);
                    }}
                  />
                ) : (
                  <div className="team-editor-photo-preview team-editor-photo-placeholder">No Photo</div>
                )}
              </div>
            </div>

            <div className="team-editor-actions">
              <button
                type="button"
                className="team-editor-btn team-editor-btn-danger"
                onClick={() => removeMember(index)}
              >
                Remove
              </button>
            </div>
            </article>
          );
        })}
      </div>
    </div>
  );
}

export default function TeamPageEditor() {
  const { admin } = useAdmin();
  const [teamContent, setTeamContent] = useState(DEFAULT_CONTENT);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [status, setStatus] = useState('');
  const [draftReady, setDraftReady] = useState(false);

  const docRef = useMemo(() => doc(db, 'siteContent', 'teamPage'), []);

  useEffect(() => {
    const load = async () => {
      if (canUseSessionStorage()) {
        try {
          const draft = window.sessionStorage.getItem(TEAM_EDITOR_DRAFT_KEY);
          if (draft) {
            const parsedDraft = JSON.parse(draft);
            setTeamContent(normalizeContent(parsedDraft));
            setStatus('Restored unsaved team page draft. Click Save Team Page to publish changes.');
            setLoading(false);
            setDraftReady(true);
            return;
          }
        } catch (error) {
          console.warn('Failed to read team page editor draft:', error);
        }
      }

      try {
        const snap = await getDoc(docRef);
        if (snap.exists()) {
          setTeamContent(normalizeContent(snap.data()));
        }
      } catch (error) {
        console.error('Failed to load team page content:', error);
        setStatus('Failed to load saved content. Showing defaults.');
      } finally {
        setLoading(false);
        setDraftReady(true);
      }
    };

    load();
  }, [docRef]);

  useEffect(() => {
    if (!draftReady || !canUseSessionStorage()) return;

    try {
      window.sessionStorage.setItem(
        TEAM_EDITOR_DRAFT_KEY,
        JSON.stringify(normalizeContent(teamContent))
      );
    } catch (error) {
      console.warn('Failed to persist team page editor draft:', error);
    }
  }, [draftReady, teamContent]);

  const updateTierMeta = (tierIndex, key, value) => {
    setTeamContent((prev) => {
      const tiers = [...prev.tiers];
      tiers[tierIndex] = { ...tiers[tierIndex], [key]: value };
      return { ...prev, tiers };
    });
  };

  const updateTierMembers = (tierIndex, members) => {
    setTeamContent((prev) => {
      const tiers = [...prev.tiers];
      tiers[tierIndex] = { ...tiers[tierIndex], members };
      return { ...prev, tiers };
    });
  };

  const addTier = () => {
    setTeamContent((prev) => ({
      ...prev,
      tiers: [
        ...prev.tiers,
        {
          eyebrow: 'New Tier',
          title: 'Tier Title',
          description: 'Describe this tier.',
          accent: 'neutral',
          members: [],
        },
      ],
    }));
  };

  const removeTier = (tierIndex) => {
    setTeamContent((prev) => ({
      ...prev,
      tiers: prev.tiers.filter((_, index) => index !== tierIndex),
    }));
  };

  const handleSave = async () => {
    setSaving(true);
    setStatus('');

    try {
      const payload = normalizeContent(teamContent);

      await setDoc(
        docRef,
        {
          ...payload,
          updatedAt: serverTimestamp(),
          updatedBy: admin?.email || 'admin',
        },
        { merge: true }
      );
      if (canUseSessionStorage()) {
        window.sessionStorage.removeItem(TEAM_EDITOR_DRAFT_KEY);
      }
      setStatus('Team page saved successfully.');
    } catch (error) {
      console.error('Failed to save team page content:', error);
      const reason = error?.message || error?.code || 'Unknown error';
      setStatus(`Failed to save team page content: ${reason}`);
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <>
        <AdminNavbar />
        <div className="admin-page">
          <div className="loading">Loading team content...</div>
        </div>
      </>
    );
  }

  return (
    <>
      <AdminNavbar />
      <div className="admin-page team-editor-page">
        <div className="admin-header team-editor-header">
          <h1>Team Page Editor</h1>
          <p>Update leadership, committees, and developers shown on the public team page.</p>
        </div>

        <MemberEditor
          title="Conveners"
          members={teamContent.leadership}
          sectionKey="leadership"
          onChange={(members) => setTeamContent((prev) => ({ ...prev, leadership: members }))}
        />

        <div className="team-editor-tier-block">
          <div className="team-editor-head">
            <h3>Committee Tiers</h3>
            <button type="button" className="team-editor-btn" onClick={addTier}>
              + Add Tier
            </button>
          </div>

          {teamContent.tiers.map((tier, tierIndex) => (
            <section key={`${tier.title}-${tierIndex}`} className="team-editor-card">
              <div className="team-editor-head">
                <h3>{tier.title || `Tier ${tierIndex + 1}`}</h3>
                <button
                  type="button"
                  className="team-editor-btn team-editor-btn-danger"
                  onClick={() => removeTier(tierIndex)}
                >
                  Remove Tier
                </button>
              </div>

              <div className="team-editor-row">
                <label>
                  Eyebrow
                  <input
                    className="team-editor-input"
                    value={tier.eyebrow}
                    onChange={(event) => updateTierMeta(tierIndex, 'eyebrow', event.target.value)}
                  />
                </label>
                <label>
                  Title
                  <input
                    className="team-editor-input"
                    value={tier.title}
                    onChange={(event) => updateTierMeta(tierIndex, 'title', event.target.value)}
                  />
                </label>
                <label>
                  Accent
                  <select
                    className="team-editor-input"
                    value={tier.accent}
                    onChange={(event) => updateTierMeta(tierIndex, 'accent', event.target.value)}
                  >
                    <option value="gold">Gold</option>
                    <option value="blue">Blue</option>
                    <option value="neutral">Neutral</option>
                  </select>
                </label>
              </div>

              <label className="team-editor-label-wide">
                Description
                <textarea
                  className="team-editor-input team-editor-textarea"
                  rows={3}
                  value={tier.description}
                  onChange={(event) => updateTierMeta(tierIndex, 'description', event.target.value)}
                />
              </label>

              <MemberEditor
                title={`${tier.title || 'Tier'} Members`}
                members={tier.members}
                sectionKey={`tier-${tierIndex}`}
                onChange={(members) => updateTierMembers(tierIndex, members)}
                compact
              />
            </section>
          ))}
        </div>

        <MemberEditor
          title="Developers"
          members={teamContent.developers}
          sectionKey="developers"
          onChange={(members) => setTeamContent((prev) => ({ ...prev, developers: members }))}
        />

        <div className="team-editor-footer">
          {status && <p className="team-editor-status">{status}</p>}
          <button type="button" className="team-editor-save" disabled={saving} onClick={handleSave}>
            {saving ? 'Saving...' : 'Save Team Page'}
          </button>
        </div>
      </div>
    </>
  );
}
