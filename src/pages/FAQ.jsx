import { useState } from "react";
import "./FAQ.css";

const faqs = [
  {
    question: 'Who can participate in LUMIERE 2026?',
    answer: 'LUMIERE 2026 is open to student filmmakers from across India. External participation is allowed in all events. Lumiere Sprint, the main event of the festival, is open to both PEC students and external participants.',
  },
  {
    question: 'What are the event dates?',
    answer: 'LUMIERE 2026 will take place from April 10 to April 12, 2026. All screenings, competitions, and festival activities will be conducted during these dates.',
  },
  {
    question: 'How do I submit my film?',
    answer: 'Upload your film to Google Drive and set sharing to "Anyone with the link can view". Create an account on our portal, fill in the submission form with your film details, paste the Google Drive link, complete the category registration, and submit. You will receive a confirmation email after successful submission.',
  },
  {
    question: 'Can I submit multiple films?',
    answer: 'Yes, participants may submit multiple different films across different categories. However, the same film cannot be submitted to multiple categories, and each submission must be registered separately.',
  },
  {
    question: 'What happens after I submit?',
    answer: 'After submission, films go through an internal review and selection process. Selected films will be notified via email and will be screened during the festival dates.',
  },
  {
    question: 'Is there a maximum file size?',
    answer: 'There is no strict file size limit since films are submitted via Google Drive. However, we recommend keeping files under 4GB for smoother playback and easier access.',
  },
  {
    question: 'What is the Lumiere Sprint?',
    answer: 'Lumiere Sprint is the main event of LUMIERE 2026 — a 48-hour filmmaking challenge where participants receive a surprise theme at kickoff and must write, shoot, and edit a complete short film within the given time.',
  },
  {
    question: 'Can I attend the festival without submitting a film?',
    answer: 'Yes, the festival is open to all cinema enthusiasts. You can attend screenings, sessions, and festival activities even if you are not participating in any competition.',
  },
  {
    question: 'How are films evaluated?',
    answer: 'Films are reviewed by a jury panel based on storytelling, creativity, technical execution, originality, and overall cinematic impact.',
  },
];

export default function FAQ() {
  const [openIndex, setOpenIndex] = useState(null);

  const toggleFaq = (index) => {
    setOpenIndex(openIndex === index ? null : index);
  };

  return (
    <div className="faq-page">
      <div className="faq-header">
        <h1 className="gradient-text">Frequently Asked <br></br> Questions</h1>
        <p>Everything you need to know about LUMIERE 2026</p>
      </div>

      <div className="faq-container">
        {faqs.map((faq, index) => (
          <div key={index} className="faq-item">
            <button
              className="faq-question"
              onClick={() => toggleFaq(index)}
            >
              <span>{faq.question}</span>
              <span
                className={`arrow ${
                  openIndex === index ? "rotate" : ""
                }`}
              >
                ▼
              </span>
            </button>

            <div
              className={`faq-answer ${
                openIndex === index ? "open" : ""
              }`}
            >
              {faq.answer}
            </div>
          </div>
        ))}
      </div>

      <div className="faq-cta">
        <h2>Still have questions?</h2>
        <p>
          Contact us at
        </p>
        <div className="faq-contact">
          <a href="mailto:lumiere.pec@gmail.com">
            <span className="faq-icon" aria-hidden="true">
              <svg viewBox="0 0 24 24" role="img" focusable="false">
                <path
                  d="M4 6h16a2 2 0 0 1 2 2v8a2 2 0 0 1-2 2H4a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2Z"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="1.8"
                  strokeLinejoin="round"
                />
                <path
                  d="m4 8 8 6 8-6"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="1.8"
                  strokeLinejoin="round"
                />
              </svg>
            </span>
            lumiere.pec@gmail.com
          </a>
          <a
            href="https://www.instagram.com/lumiere_pec/"
            target="_blank"
            rel="noreferrer"
          >
            <span className="faq-icon" aria-hidden="true">
              <svg viewBox="0 0 24 24" role="img" focusable="false">
                <rect
                  x="3"
                  y="3"
                  width="18"
                  height="18"
                  rx="5"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="1.8"
                />
                <circle
                  cx="12"
                  cy="12"
                  r="4"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="1.8"
                />
                <circle cx="17.5" cy="6.5" r="1" fill="currentColor" />
              </svg>
            </span>
            @lumiere_pec
          </a>
        </div>
      </div>
    </div>
  );
}
