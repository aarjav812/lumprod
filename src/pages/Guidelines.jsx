import { useNavigate } from 'react-router-dom';
import './Guidelines.css';

const submissionRules = [
  {
    title: 'Ownership & Usage Rights',
    desc: 'Participants must own or have proper rights to all content used in the film, including music, footage, and artwork. Music and third-party assets are allowed only if you have legal permission or licenses to use them.',
  },
  {
    title: 'Accurate Film Information',
    desc: 'Ensure the film title, synopsis, and credits submitted are accurate and match the final film. English subtitles are mandatory for all non-English dialogues.',
  },
  {
    title: 'Acceptable Content Policy',
    desc: 'All submissions must comply with applicable laws and festival policies. Films containing harassment, hate speech, or harmful or illegal content may be disqualified.',
  },
  {
    title: 'Single Entry per Film',
    desc: 'The same film cannot be submitted multiple times under different entries. Participants may submit different films separately.',
  },
  {
    title: 'Complete & Valid Submission',
    desc: 'Ensure your upload link works properly and all submission details are filled correctly before final submission. Incomplete or inaccessible entries may not be reviewed.',
  },
  {
    title: 'Technical Presentation Standards',
    desc: 'Films should be submitted in a clear, watchable format with proper audio and video quality to ensure smooth screening during the festival.',
  },
];

export default function Guidelines() {
  const navigate = useNavigate();
  return (
    <div className="guideline-page">
      <div className="container">
        <div className="page-header">
          <h1 className="page-title">
            <span className="gradient-text">Submission Guidelines</span>
          </h1>
          <p className="gradient-content">
            Technical specifications and rules to ensure <br></br>your submission meets LUMIERE 2026 standards.
          </p>
        </div>

        {/* Submission Rules */}
        <section className="section-wrapper" >
          {/* <h2 className="section-title" style={{ marginBottom: '1rem' }}>Submission Rules</h2> */}
          <div className="guidelines-grid">
            {submissionRules.map((rule, i) => (
              <div key={i} className="guideline-card">
                <div className="guideline-content">
                  <h3>{rule.title}</h3>
                  <p>{rule.desc}</p>
                </div>
              </div>
            ))}
          </div>
        </section>

        {/* Brochure Section */}
        <section className="section-wrapper" style={{ textAlign: 'center' }}>
          <h2 className="section-title" style={{ marginBottom: '1rem' }}>
           Event Brochure
          </h2>
          <p className="guidelines-intro-copy">
            Download or view our complete event brochure for detailed information about LUMIERE 2026.
          </p>
          <a 
            href="https://drive.google.com/file/d/1UXi2SCWgXVPrBOWbAM5q6VLzNIYR0pNj/view?usp=sharing"
            target="_blank"
            rel="noopener noreferrer"
            className="submit-main-btn"
            style={{ display: 'inline-block', textDecoration: 'none', padding: '0.75rem 1.5rem' }}
          >
            View Brochure
          </a>
        </section>

        {/* Upload Instructions */}
        <div className='guidelines-wrapper'>
          <section className="submit-list" style={{ marginBottom: '3rem' }}>
            <h2 className="guidelines-subheading">
              📤 How to Submit ?
            </h2>
            <ul className="guidelines-steps-list">
              <li 
              style={{ marginBottom: '0.5rem' }}>Upload your film to <strong style={{ color: 'var(--text-primary)' }}>Google Drive</strong></li>
              <li style={{ marginBottom: '0.5rem' }}>Set sharing permissions to <strong style={{ color: 'var(--text-primary)' }}>&quot;Anyone with the link can view&quot;</strong></li>
              <li style={{ marginBottom: '0.5rem' }}>Create an account or log in to the Lumiere portal</li>
              <li style={{ marginBottom: '0.5rem' }}>Fill in the submission form with film details</li>
              <li style={{ marginBottom: '0.5rem' }}>Paste your Google Drive link in the submission form</li>
              <li style={{ marginBottom: '0.5rem' }}>Complete payment for your category</li>
              <li>Submit and wait for confirmation email</li>
            </ul>
          </section>

          {/* Important Notes */}
          <div className="important-section">
            <div className="important-accent"></div>
            <div className="important-content">

              <h2 className="guidelines-subheading guidelines-subheading-accent">
                ⚠️ Important Notes
              </h2>
              <ul className="guidelines-notes-list">
                <li>Keep your Google Drive link accessible until the festival ends</li>
                <li>Do not delete or move your uploaded files after submission</li>
                <li>Submission fees are non-refundable</li>
                <li>Results will be announced on the final day of the festival</li>
                <li>Selected films will be notified via email</li>
              </ul>
            </div>
          </div>
        </div>

        {/* CTA */}
      <section className="final-cta">
        <h2>Ready to Showcase Your Vision?</h2>
        <button
          type="button"
          className="submit-main-btn"
          onClick={() => navigate('/submit')}
        >
          Submit video
        </button>
      </section>
      </div>
    </div>
  );
}
