import { useState, useRef, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../AuthContext';
import { db } from '../firebaseDb';
import { doc, setDoc, getDoc, serverTimestamp } from 'firebase/firestore';
import { sendOtp, verifyOtp } from '../services/otpService';

export default function Register() {
  // Step 1 = email + OTP verification (or Google), Step 2 = remaining details + account creation
  const [step, setStep] = useState(1);
  const [isGoogleUser, setIsGoogleUser] = useState(false);
  const [googleUser, setGoogleUser] = useState(null);

  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    college: '',
    password: '',
    confirmPassword: '',
  });

  // OTP state
  const [otp, setOtp] = useState(['', '', '', '', '', '']);
  const [otpSent, setOtpSent] = useState(false);
  const [otpVerified, setOtpVerified] = useState(false);
  const [otpLoading, setOtpLoading] = useState(false);
  const [cooldown, setCooldown] = useState(0);
  const otpRefs = useRef([]);

  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [loading, setLoading] = useState(false);
  const { signUp, signInWithGoogle } = useAuth();
  const navigate = useNavigate();

  // Cooldown timer for resend
  useEffect(() => {
    if (cooldown <= 0) return;
    const timer = setTimeout(() => setCooldown(c => c - 1), 1000);
    return () => clearTimeout(timer);
  }, [cooldown]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  // ─── OTP input handlers ────────────────────────────────────
  const handleOtpChange = (index, value) => {
    // Only allow digits
    if (value && !/^\d$/.test(value)) return;

    const newOtp = [...otp];
    newOtp[index] = value;
    setOtp(newOtp);

    // Auto-focus next input
    if (value && index < 5) {
      otpRefs.current[index + 1]?.focus();
    }
  };

  const handleOtpKeyDown = (index, e) => {
    if (e.key === 'Backspace' && !otp[index] && index > 0) {
      otpRefs.current[index - 1]?.focus();
    }
  };

  const handleOtpPaste = (e) => {
    e.preventDefault();
    const pasted = e.clipboardData.getData('text').replace(/\D/g, '').slice(0, 6);
    if (!pasted) return;
    const newOtp = [...otp];
    for (let i = 0; i < 6; i++) {
      newOtp[i] = pasted[i] || '';
    }
    setOtp(newOtp);
    // Focus the next empty or the last
    const focusIdx = Math.min(pasted.length, 5);
    otpRefs.current[focusIdx]?.focus();
  };

  // ─── Send OTP ──────────────────────────────────────────────
  const handleSendOtp = async () => {
    setError('');
    setSuccess('');

    if (!formData.email.trim()) {
      return setError('Please enter your email address');
    }
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
      return setError('Please enter a valid email address');
    }

    setOtpLoading(true);
    try {
      await sendOtp(formData.email);
      setOtpSent(true);
      setCooldown(60);
      setSuccess('Verification code sent! Check your inbox.');
      // Focus first OTP input after a tick
      setTimeout(() => otpRefs.current[0]?.focus(), 100);
    } catch (err) {
      const msg = err?.message || 'Failed to send OTP. Please try again.';
      setError(msg);
    } finally {
      setOtpLoading(false);
    }
  };

  // ─── Verify OTP ────────────────────────────────────────────
  const handleVerifyOtp = () => {
    setError('');
    setSuccess('');

    const code = otp.join('');
    if (code.length !== 6) {
      return setError('Please enter the full 6-digit code');
    }

    try {
      verifyOtp(formData.email, code);
      setOtpVerified(true);
      setSuccess('Email verified! Complete your registration below.');
      setStep(2);
    } catch (err) {
      setError(err.message || 'Invalid OTP. Please try again.');
    }
  };

  // ─── Google Sign-In ────────────────────────────────────────
  const handleGoogleSignIn = async () => {
    setError('');
    setSuccess('');
    setLoading(true);

    try {
      const result = await signInWithGoogle();
      const user = result.user;

      // Check if user already has a Firestore profile (existing user)
      const userDoc = await getDoc(doc(db, 'users', user.uid));
      if (userDoc.exists()) {
        // Existing user — redirect to dashboard
        navigate('/categories');
        return;
      }

      // New Google user — pre-fill data and move to Step 2
      setIsGoogleUser(true);
      setGoogleUser(user);
      setOtpVerified(true);
      setFormData(prev => ({
        ...prev,
        name: user.displayName || '',
        email: user.email || '',
      }));
      setSuccess('Google account connected! Complete your details below.');
      setStep(2);
    } catch (err) {
      if (err.code === 'auth/popup-closed-by-user') {
        setError('Sign-in cancelled. Please try again.');
      } else if (err.code === 'auth/account-exists-with-different-credential') {
        setError('An account already exists with this email. Try signing in with email/password.');
      } else {
        setError('Google sign-in failed. Please try again.');
      }
    } finally {
      setLoading(false);
    }
  };

  // ─── Create account (Step 2) ───────────────────────────────
  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    if (!otpVerified && !isGoogleUser) {
      return setError('Please verify your email first');
    }

    if (!/^[6-9]\d{9}$/.test(formData.phone)) {
      return setError('Please enter a valid Indian phone number');
    }

    // Password validation only for non-Google users
    if (!isGoogleUser) {
      if (formData.password !== formData.confirmPassword) {
        return setError('Passwords do not match');
      }
      if (formData.password.length < 6) {
        return setError('Password must be at least 6 characters');
      }
    }

    setLoading(true);

    try {
      let uid;

      if (isGoogleUser) {
        // Google user is already authenticated — just save profile data
        uid = googleUser.uid;
      } else {
        // Email/password registration
        const userCredential = await signUp(formData.email, formData.password, {
          displayName: formData.name,
          phone: formData.phone,
          college: formData.college,
        });
        uid = userCredential.user.uid;
      }

      await setDoc(doc(db, 'users', uid), {
        name: formData.name,
        email: formData.email,
        phoneNumber: formData.phone,
        collegeName: formData.college,
        emailVerified: true,
        createdAt: serverTimestamp(),
        status: 'active',
        registrations: [],
        teams: []
      });

      navigate('/categories');
    } catch (err) {
      if (err.code === 'auth/email-already-in-use') {
        setError('An account with this email already exists');
      } else if (err.code === 'auth/invalid-email') {
        setError('Invalid email address');
      } else if (err.code === 'auth/weak-password') {
        setError('Password is too weak');
      } else {
        setError('Failed to create account. Please try again.');
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="auth-page">
      <div className="auth-container">
        <div className="auth-card">
          <h1 className="auth-title">Create Account</h1>
          <p className="auth-subtitle">Register to submit your films to Lumiere 2026</p>

          {/* Step indicator */}
          <div className="otp-steps">
            <div className={`otp-step ${step >= 1 ? 'active' : ''} ${otpVerified ? 'completed' : ''}`}>
              <span className="otp-step-number">{otpVerified ? 'Done' : '1'}</span>
              <span className="otp-step-label">Verify Email</span>
            </div>
            <div className="otp-step-line" />
            <div className={`otp-step ${step >= 2 ? 'active' : ''}`}>
              <span className="otp-step-number">2</span>
              <span className="otp-step-label">Your Details</span>
            </div>
          </div>

          {error && <div className="error-message">{error}</div>}
          {success && <div className="success-message">{success}</div>}

          {/* ─── STEP 1: Email + OTP ─── */}
          {step === 1 && (
            <div className="otp-section">
              {/* Google Sign-In Option */}
              <button
                type="button"
                className="btn-google"
                onClick={handleGoogleSignIn}
                disabled={loading}
              >
                <svg className="google-icon" viewBox="0 0 24 24" width="20" height="20">
                  <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92a5.06 5.06 0 0 1-2.2 3.32v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.1z" fill="#4285F4"/>
                  <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853"/>
                  <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05"/>
                  <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335"/>
                </svg>
                {loading ? 'Connecting...' : 'Continue with Google'}
              </button>

              <div className="auth-divider">
                <span>or register with email</span>
              </div>

              <div className="form-group">
                <label className="form-label" htmlFor="email">Email Address</label>
                <div className="otp-email-row">
                  <input
                    type="email"
                    id="email"
                    name="email"
                    className="form-input"
                    value={formData.email}
                    onChange={handleChange}
                    placeholder="you@example.com"
                    disabled={otpSent}
                    required
                  />
                  <button
                    type="button"
                    className="btn btn-primary otp-send-btn"
                    onClick={handleSendOtp}
                    disabled={otpLoading || (otpSent && cooldown > 0)}
                  >
                    {otpLoading
                      ? 'Sending...'
                      : otpSent
                        ? cooldown > 0
                          ? `Resend (${cooldown}s)`
                          : 'Resend'
                        : 'Send OTP'}
                  </button>
                </div>
                {otpSent && !otpVerified && (
                  <button
                    type="button"
                    className="otp-change-email"
                    onClick={() => {
                      setOtpSent(false);
                      setOtp(['', '', '', '', '', '']);
                      setError('');
                      setSuccess('');
                      setCooldown(0);
                    }}
                  >
                    Change email
                  </button>
                )}
              </div>

              {otpSent && (
                <>
                  <div className="form-group">
                    <label className="form-label">Enter Verification Code</label>
                    <div className="otp-inputs" onPaste={handleOtpPaste}>
                      {otp.map((digit, i) => (
                        <input
                          key={i}
                          ref={el => (otpRefs.current[i] = el)}
                          type="text"
                          inputMode="numeric"
                          maxLength={1}
                          className="otp-digit"
                          value={digit}
                          onChange={e => handleOtpChange(i, e.target.value)}
                          onKeyDown={e => handleOtpKeyDown(i, e)}
                          autoComplete="one-time-code"
                        />
                      ))}
                    </div>
                  </div>

                  <button
                    type="button"
                    className="btn btn-primary"
                    style={{ width: '100%' }}
                    onClick={handleVerifyOtp}
                    disabled={otpLoading || otp.join('').length !== 6}
                  >
                    {otpLoading ? 'Verifying...' : 'Verify Email'}
                  </button>
                </>
              )}
            </div>
          )}

          {/* ─── STEP 2: Registration details ─── */}
          {step === 2 && (
            <form onSubmit={handleSubmit}>
              {/* Show verified email (read-only) */}
              <div className="form-group">
                <label className="form-label">Email {isGoogleUser ? '(Google)' : '(verified)'}</label>
                <div className="otp-verified-email">
                  <span>{formData.email}</span>
                  <span className="otp-verified-badge">{isGoogleUser ? 'Google' : 'Verified'}</span>
                </div>
              </div>

              <div className="form-group">
                <label className="form-label" htmlFor="name">Full Name</label>
                <input
                  type="text"
                  id="name"
                  name="name"
                  className="form-input"
                  value={formData.name}
                  onChange={handleChange}
                  placeholder="John Doe"
                  required
                />
              </div>

              <div className="form-group">
                <label className="form-label" htmlFor="phone">Phone Number</label>
                <input
                  type="tel"
                  id="phone"
                  name="phone"
                  className="form-input"
                  value={formData.phone}
                  onChange={handleChange}
                  placeholder="9876543210"
                  required
                />
              </div>

              <div className="form-group">
                <label className="form-label" htmlFor="college">College/Institution</label>
                <input
                  type="text"
                  id="college"
                  name="college"
                  className="form-input"
                  value={formData.college}
                  onChange={handleChange}
                  placeholder="Punjab Engineering College"
                  required
                />
              </div>

              {!isGoogleUser && (
                <>
                  <div className="form-group">
                    <label className="form-label" htmlFor="password">Password</label>
                    <input
                      type="password"
                      id="password"
                      name="password"
                      className="form-input"
                      value={formData.password}
                      onChange={handleChange}
                      placeholder="At least 6 characters"
                      required
                    />
                  </div>

                  <div className="form-group">
                    <label className="form-label" htmlFor="confirmPassword">Confirm Password</label>
                    <input
                      type="password"
                      id="confirmPassword"
                      name="confirmPassword"
                      className="form-input"
                      value={formData.confirmPassword}
                      onChange={handleChange}
                      placeholder="••••••••"
                      required
                    />
                  </div>
                </>
              )}

              <button type="submit" className="btn btn-primary" style={{ width: '100%' }} disabled={loading}>
                {loading ? 'Creating Account...' : 'Create Account'}
              </button>
            </form>
          )}

          <div className="auth-footer">
            <p>Already have an account? <Link to="/login">Sign In</Link></p>
          </div>
        </div>
      </div>
    </div>
  );
}
