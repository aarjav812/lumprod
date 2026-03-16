import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../AuthContext';
import { db } from '../firebaseDb';
import { collection, addDoc, serverTimestamp, getDocs, query, where } from 'firebase/firestore';
import './Submit.css';

// Default categories if none exist in Firestore
const DEFAULT_CATEGORIES = [
  { id: 'northern-ray', name: 'The Northern Ray', desc: 'Regional Short Film (5-20 min)', fee: 150 },
  { id: 'prism', name: 'Prism Showcase', desc: 'National Student Film (5-15 min)', fee: 150 },
  { id: 'sprint', name: 'Lumiere Sprint', desc: '48-Hour Challenge (3-7 min)', fee: 150 },
  { id: 'vertical', name: 'Vertical Ray', desc: 'Mobile Vertical (60 sec)', fee: 100 },
  { id: 'Verite', name: 'Verite', desc: 'Documentary (15-30 min)', fee: 100 },
];

const WORKSHOP_CATEGORY_TOKENS = ['aperture-lab', 'script-shadow', 'splice', 'chroma'];
const FUN_CATEGORY_TOKENS = ['under-the-stars', 'open-mic', 'face-painting', 'photo-walks'];

const normalize = (value) =>
  String(value || '')
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, '-');

const inferEventType = (event) => {
  const explicitType = normalize(event.eventType);
  if (explicitType === 'workshop' || explicitType === 'fun') {
    return explicitType;
  }
  if (explicitType.startsWith('compet')) {
    return 'competition';
  }

  const category = normalize(event.category);
  if (WORKSHOP_CATEGORY_TOKENS.some((token) => category.includes(token))) return 'workshop';
  if (FUN_CATEGORY_TOKENS.some((token) => category.includes(token))) return 'fun';
  return 'competition';
};

const generateSubmissionId = () => {
  const timestamp = Date.now().toString(36).toUpperCase();
  const random = crypto.getRandomValues(new Uint32Array(1))[0].toString(36).slice(0, 4).toUpperCase();
  return `LUM-2026-${timestamp}-${random}`;
};

export default function Submit() {
  const [step, setStep] = useState(1);
  const [categories, setCategories] = useState(DEFAULT_CATEGORIES);
  const [loadingCategories, setLoadingCategories] = useState(true);
  const [formData, setFormData] = useState({
    // Film Details
    title: '',
    category: '',
    duration: '',
    language: '',
    synopsis: '',
    // Links
    filmLink: '',
    posterLink: '',
    subtitlesLink: '',
    // Team
    directorName: '',
    directorEmail: '',
    directorPhone: '',
    teamMemberEmails: ['', '', '', ''],
  });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [, setSelectedCategoryDetails] = useState(null);
  const { user } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    loadCategories();
  }, []);

  const loadCategories = async () => {
    try {
      const snapshot = await getDocs(collection(db, 'events'));
      if (snapshot.size > 0) {
        const eventsData = [];
        snapshot.forEach((doc) => {
          const event = doc.data();
          if (inferEventType(event) !== 'competition') {
            return;
          }
          
          // Try to find matching category in DEFAULT_CATEGORIES by name
          const matchedDefault = DEFAULT_CATEGORIES.find(c => 
            c.name.toLowerCase() === String(event.eventName || '').toLowerCase()
          );
          
          // Use the DEFAULT_CATEGORIES id and fee if found, otherwise use Firebase data
          const categoryId = matchedDefault?.id || event.category || doc.id;
          const fee = event.regFees || matchedDefault?.fee || 150;
          
          eventsData.push({
            id: categoryId,  // Use matched ID from DEFAULT_CATEGORIES or fallback
            name: event.eventName || 'Untitled competition',
            desc: event.briefDescription || 'Competition category',
            fee: fee
          });
        });

        if (eventsData.length > 0) {
          setCategories(eventsData);
        } else {
          setCategories(DEFAULT_CATEGORIES);
        }
      }
    } catch (error) {
      console.error('Error loading categories:', error);
      // Keep default categories on error
    } finally {
      setLoadingCategories(false);
    }
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    if (name.startsWith('teamMemberEmail-')) {
      const index = parseInt(name.split('-')[1]);
      setFormData(prev => {
        const newEmails = [...prev.teamMemberEmails];
        newEmails[index] = value;
        return { ...prev, teamMemberEmails: newEmails };
      });
    } else {
      setFormData(prev => ({ ...prev, [name]: value }));
      
      // Show category details when category is selected
      if (name === 'category') {
        const selected = categories.find(c => c.id === value);
        setSelectedCategoryDetails(selected || null);
      }
    }
  };

  const validateStep = () => {
    if (step === 1) {
      if (!formData.title || !formData.category || !formData.duration || !formData.language || !formData.synopsis) {
        setError('Please fill in all required fields');
        return false;
      }
    } else if (step === 2) {
      if (!formData.filmLink) {
        setError('Film link is required');
        return false;
      }
      // Basic Google Drive link validation
      if (!formData.filmLink.includes('drive.google.com')) {
        setError('Please provide a valid Google Drive link');
        return false;
      }
    } else if (step === 3) {
      if (!formData.directorName || !formData.directorEmail || !formData.directorPhone) {
        setError('Director information is required');
        return false;
      }
    }
    setError('');
    return true;
  };

  const nextStep = () => {
    if (validateStep()) {
      setStep(prev => prev + 1);
    }
  };

  const prevStep = () => {
    setStep(prev => prev - 1);
    setError('');
  };

  const validateUserEmails = async (directorEmail, teamMemberEmails) => {
    try {
      // Collect all emails to validate (director + team members)
      const allEmails = [directorEmail, ...teamMemberEmails.filter(email => email.trim() !== '')];
      
      // Check if each email is registered
      for (const email of allEmails) {
        const usersQuery = query(collection(db, 'users'), where('email', '==', email));
        const snapshot = await getDocs(usersQuery);
        
        if (snapshot.empty) {
          throw new Error(`Email "${email}" is not registered in the system`);
        }
      }
      
      return true;
    } catch (error) {
      throw new Error(error.message || 'Email validation failed');
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validateStep()) return;
    
    setLoading(true);
    setError('');

    try {
      if (!user) {
        throw new Error('Authentication required. Please log in again.');
      }
      
      // Validate all team member emails and director email
      const validTeamEmails = formData.teamMemberEmails.filter(email => email.trim() !== '');
      await validateUserEmails(formData.directorEmail, validTeamEmails);
      
      const selectedCategory = categories.find(c => c.id === formData.category);
      const submissionId = generateSubmissionId();
      
      // Get fee - try multiple approaches
      let fee = 0;
      
      // Approach 1: Get from selectedCategory (loaded from Firebase)
      if (selectedCategory && selectedCategory.fee) {
        fee = selectedCategory.fee;
      }
      
      // Approach 2: If still 0 or not found, search by name in DEFAULT_CATEGORIES
      if (!fee && selectedCategory) {
        const defaultByName = DEFAULT_CATEGORIES.find(c => 
          c.name.toLowerCase() === selectedCategory.name.toLowerCase()
        );
        if (defaultByName) {
          fee = defaultByName.fee;
        }
      }
      
      // Approach 3: Direct search in DEFAULT_CATEGORIES by category ID
      if (!fee) {
        const defaultByID = DEFAULT_CATEGORIES.find(c => c.id === formData.category);
        if (defaultByID) {
          fee = defaultByID.fee;
        }
      }
      
      // Approach 4: Hardcoded fallback
      if (!fee) {
        fee = 150;
      }
      
      // Save submission with all team information (using lumiere_submissions collection)
      await addDoc(collection(db, 'lumiere_submissions'), {
        submissionId,
        userId: user.uid,
        userEmail: user.email,
        
        // Film info
        title: formData.title,
        category: formData.category,
        categoryName: selectedCategory?.name || '',
        synopsis: formData.synopsis,
        duration: formData.duration,
        language: formData.language,
        
        // Director/Team info
        directorName: formData.directorName,
        directorEmail: formData.directorEmail,
        directorPhone: formData.directorPhone,
        teamMemberEmails: validTeamEmails,
        totalTeamMembers: validTeamEmails.length + 1, // including director
        
        // Links
        filmLink: formData.filmLink,
        posterLink: formData.posterLink || '',
        subtitlesLink: formData.subtitlesLink || '',
        
        // Fee - EXPLICITLY ensure it's a number and not 0
        fee: parseInt(fee) || 150,
        
        // Status
        status: 'submitted',
        paymentStatus: 'pending',
        
        // Timestamps
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp()
      });

      setSuccess(true);
      setTimeout(() => navigate('/dashboard'), 2000);
    } catch (err) {
      console.error('Submission error:', err);
      setError(err.message || 'Failed to submit. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  if (success) {
    return (
      <div className="submit-page">
        <div className="container submit-shell">
          <div className="success-container">
            <div className="success-icon">Done</div>
            <h1>Submission Received!</h1>
            <p>Your film has been successfully submitted. Redirecting to dashboard...</p>
          </div>
        </div>
      </div>
    );
  }

  if (loadingCategories) {
    return (
      <div className="submit-page">
        <div className="container submit-shell">
          <div className="loading">Loading categories...</div>
        </div>
      </div>
    );
  }

  return (
    <div className="submit-page">
      <div className="container submit-shell">
        <div className="submit-container">
          <h1 className="page-title">Submit Your Film</h1>
          
          {/* Progress Steps */}
          <div className="progress-steps">
            <div className={`progress-step ${step >= 1 ? 'active' : ''}`}>
              <span className="step-number">1</span>
              <span className="step-label">Film Details</span>
            </div>
            <div className={`progress-step ${step >= 2 ? 'active' : ''}`}>
              <span className="step-number">2</span>
              <span className="step-label">Upload Links</span>
            </div>
            <div className={`progress-step ${step >= 3 ? 'active' : ''}`}>
              <span className="step-number">3</span>
              <span className="step-label">Team Info</span>
            </div>
          </div>

          {error && <div className="error-message">{error}</div>}

          <form onSubmit={handleSubmit} className="submit-form">
            {/* Step 1: Film Details */}
            {step === 1 && (
              <div className="form-step">
                <h2 className="step-title">Film Details</h2>
                
                <div className="form-group">
                  <label className="form-label">Film Title *</label>
                  <input
                    type="text"
                    name="title"
                    className="form-input"
                    value={formData.title}
                    onChange={handleChange}
                    placeholder="Enter your film's title"
                    required
                  />
                </div>

                <div className="form-group">
                  <label className="form-label">Category *</label>
                  <select
                    name="category"
                    className="form-input"
                    value={formData.category}
                    onChange={handleChange}
                    required
                  >
                    <option value="">Select a category</option>
                    {categories.map(cat => (
                      <option key={cat.id} value={cat.id}>
                        {cat.name} - {cat.desc} - ₹{cat.fee}
                      </option>
                    ))}
                  </select>
                </div>

                <div className="form-row">
                  <div className="form-group">
                    <label className="form-label">Duration (minutes) *</label>
                    <input
                      type="number"
                      name="duration"
                      className="form-input"
                      value={formData.duration}
                      onChange={handleChange}
                      placeholder="e.g., 15"
                      min="1"
                      max="60"
                      required
                    />
                  </div>

                  <div className="form-group">
                    <label className="form-label">Primary Language *</label>
                    <input
                      type="text"
                      name="language"
                      className="form-input"
                      value={formData.language}
                      onChange={handleChange}
                      placeholder="e.g., Hindi, English"
                      required
                    />
                  </div>
                </div>

                <div className="form-group">
                  <label className="form-label">Synopsis *</label>
                  <textarea
                    name="synopsis"
                    className="form-input form-textarea"
                    value={formData.synopsis}
                    onChange={handleChange}
                    placeholder="Brief description of your film (100-500 characters)"
                    rows="4"
                    required
                  />
                </div>

                <div className="form-actions">
                  <button type="button" className="btn btn--primary" onClick={nextStep}>
                    Continue
                  </button>
                </div>
              </div>
            )}

            {/* Step 2: Upload Links */}
            {step === 2 && (
              <div className="form-step">
                <h2 className="step-title">Upload Links</h2>
                <p className="step-description">
                  Upload your files to Google Drive and share the links below. 
                  Make sure the links are accessible to anyone with the link.
                </p>
                
                <div className="form-group">
                  <label className="form-label">Film Link (Google Drive) *</label>
                  <input
                    type="url"
                    name="filmLink"
                    className="form-input"
                    value={formData.filmLink}
                    onChange={handleChange}
                    placeholder="https://drive.google.com/file/d/..."
                    required
                  />
                  <span className="form-hint">MP4 format recommended. Max 4GB.</span>
                </div>

                <div className="form-group">
                  <label className="form-label">Poster Image (Google Drive)</label>
                  <input
                    type="url"
                    name="posterLink"
                    className="form-input"
                    value={formData.posterLink}
                    onChange={handleChange}
                    placeholder="https://drive.google.com/file/d/..."
                  />
                  <span className="form-hint">JPG/PNG, minimum 1080x1920px</span>
                </div>

                <div className="form-group">
                  <label className="form-label">Subtitles (Google Drive)</label>
                  <input
                    type="url"
                    name="subtitlesLink"
                    className="form-input"
                    value={formData.subtitlesLink}
                    onChange={handleChange}
                    placeholder="https://drive.google.com/file/d/..."
                  />
                  <span className="form-hint">SRT format. Required if non-English dialogue.</span>
                </div>

                <div className="form-actions">
                  <button type="button" className="btn btn--secondary" onClick={prevStep}>
                    Back
                  </button>
                  <button type="button" className="btn btn--primary" onClick={nextStep}>
                    Continue
                  </button>
                </div>
              </div>
            )}

            {/* Step 3: Team Info */}
            {step === 3 && (
              <div className="form-step">
                <h2 className="step-title">Team Information</h2>
                
                <div className="form-group">
                  <label className="form-label">Director Name *</label>
                  <input
                    type="text"
                    name="directorName"
                    className="form-input"
                    value={formData.directorName}
                    onChange={handleChange}
                    placeholder="Full name"
                    required
                  />
                </div>

                <div className="form-row">
                  <div className="form-group">
                    <label className="form-label">Director Email *</label>
                    <input
                      type="email"
                      name="directorEmail"
                      className="form-input"
                      value={formData.directorEmail}
                      onChange={handleChange}
                      placeholder="director@example.com"
                      required
                    />
                  </div>

                  <div className="form-group">
                    <label className="form-label">Director Phone *</label>
                    <input
                      type="tel"
                      name="directorPhone"
                      className="form-input"
                      value={formData.directorPhone}
                      onChange={handleChange}
                      placeholder="9876543210"
                      required
                    />
                  </div>
                </div>

                <div className="form-group">
                  <label className="form-label">Additional Team Members (Optional)</label>
                  <p className="form-hint" style={{marginBottom: '15px'}}>Add up to 4 team member email addresses</p>
                  {formData.teamMemberEmails.map((email, index) => (
                    <div key={index} className="form-group" style={{marginBottom: '12px'}}>
                      <input
                        type="email"
                        name={`teamMemberEmail-${index}`}
                        className="form-input"
                        value={email}
                        onChange={handleChange}
                        placeholder={`Team member ${index + 1} email (optional)`}
                      />
                    </div>
                  ))}
                </div>

                <div className="form-actions">
                  <button type="button" className="btn btn--secondary" onClick={prevStep}>
                    Back
                  </button>
                  <button type="submit" className="btn btn--primary" disabled={loading}>
                    {loading ? 'Submitting...' : 'Submit Film'}
                  </button>
                </div>
              </div>
            )}
          </form>
        </div>
      </div>
    </div>
  );
}
