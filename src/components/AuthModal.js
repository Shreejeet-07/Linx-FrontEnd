import { useState, useEffect, useRef, useCallback } from 'react';
import { login, googleAuth } from '../store';
import './AuthModal.css';

const GOOGLE_CLIENT_ID = process.env.REACT_APP_GOOGLE_CLIENT_ID;

export default function AuthModal({ mode, onClose, onToggle, onAuth }) {
  const [emailOrUsername, setEmailOrUsername] = useState('');
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState('');
  const [googleCredential, setGoogleCredential] = useState(null);
  const [googleEmail, setGoogleEmail] = useState('');
  const [googleStep, setGoogleStep] = useState(false);
  const [gsiReady, setGsiReady] = useState(false);
  const btnRef = useRef(null);

  useEffect(() => {
    setError(''); setEmailOrUsername(''); setUsername(''); setPassword('');
    setGoogleStep(false); setGoogleCredential(null); setGoogleEmail(''); setGsiReady(false);
  }, [mode]);

  const handleGoogleResponse = useCallback(async (response) => {
    setError('');
    const result = await googleAuth({ credential: response.credential });
    if (result.error) { setError(result.error); return; }
    if (result.newUser) {
      setGoogleCredential(response.credential);
      setGoogleEmail(result.email);
      setGoogleStep(true);
      return;
    }
    onAuth(result.user);
    onClose();
  }, [onAuth, onClose]);

  useEffect(() => {
    if (!GOOGLE_CLIENT_ID || googleStep) return;
    function initAndRender() {
      if (!window.google || !btnRef.current) return;
      window.google.accounts.id.initialize({ client_id: GOOGLE_CLIENT_ID, callback: handleGoogleResponse });
      window.google.accounts.id.disableAutoSelect();
      window.google.accounts.id.renderButton(btnRef.current, {
        theme: 'outline', size: 'large',
        width: btnRef.current.offsetWidth || 352,
        text: mode === 'signup' ? 'signup_with' : 'signin_with',
        logo_alignment: 'left',
      });
      setGsiReady(true);
    }
    const existing = document.getElementById('google-gsi');
    if (existing && window.google) { initAndRender(); return; }
    if (!existing) {
      const script = document.createElement('script');
      script.id = 'google-gsi';
      script.src = 'https://accounts.google.com/gsi/client';
      script.async = true;
      script.onload = initAndRender;
      document.body.appendChild(script);
    } else {
      existing.addEventListener('load', initAndRender);
    }
  }, [mode, googleStep, handleGoogleResponse]);

  useEffect(() => {
    if (!btnRef.current || !window.google || googleStep) return;
    window.google.accounts.id.renderButton(btnRef.current, {
      theme: 'outline', size: 'large',
      width: btnRef.current.offsetWidth || 352,
      text: mode === 'signup' ? 'signup_with' : 'signin_with',
      logo_alignment: 'left',
    });
    setGsiReady(true);
  }, [googleStep, mode]);

  async function handleGoogleSetup(e) {
    e.preventDefault();
    setError('');
    if (!username.trim()) { setError('Username is required.'); return; }
    if (password.length < 8) { setError('Password must be at least 8 characters.'); return; }
    const result = await googleAuth({ credential: googleCredential, password, username });
    if (result.error) { setError(result.error); return; }
    onAuth(result.user);
    onClose();
  }

  async function handleLogin(e) {
    e.preventDefault();
    setError('');
    if (!emailOrUsername.trim() || !password.trim()) { setError('All fields are required.'); return; }
    const result = await login({ emailOrUsername, password });
    if (result.error) { setError(result.error); return; }
    onAuth(result.user);
    onClose();
  }

  // ── Step 2: username + password setup after Google signup ──
  if (googleStep) {
    return (
      <div className="modal-backdrop" onClick={e => e.target === e.currentTarget && onClose()}>
        <div className="modal-box">
          <button type="button" className="modal-close" onClick={onClose}>×</button>
          <h2>Almost there!</h2>
          <p className="modal-sub">Setting up your Linx for <strong>{googleEmail}</strong></p>
          <form onSubmit={handleGoogleSetup}>
            <div className="field">
              <label>Username</label>
              <div className="username-row">
                <span>linx.app/</span>
                <input type="text" placeholder="yourname" value={username} onChange={e => setUsername(e.target.value)} autoFocus />
              </div>
            </div>
            <div className="field">
              <label>Set a Password</label>
              <div style={{ position: 'relative', display: 'flex', alignItems: 'center' }}>
                <input type={showPassword ? 'text' : 'password'} placeholder="Min 8 characters" value={password} onChange={e => setPassword(e.target.value)} style={{ flex: 1, paddingRight: '2.5rem' }} />
                <button type="button" onClick={() => setShowPassword(p => !p)} style={{ position: 'absolute', right: '0.7rem', background: 'none', border: 'none', cursor: 'pointer', fontSize: '1.1rem', color: 'var(--muted)' }}>
                  {showPassword ? '🙈' : '👁️'}
                </button>
              </div>
            </div>
            {error && <p className="modal-error">{error}</p>}
            <button type="submit" className="btn btn-primary modal-submit">Create my Linx →</button>
          </form>
        </div>
      </div>
    );
  }

  // ── Signup: Google only ────────────────────────────────────
  if (mode === 'signup') {
    return (
      <div className="modal-backdrop" onClick={e => e.target === e.currentTarget && onClose()}>
        <div className="modal-box">
          <button type="button" className="modal-close" onClick={onClose}>×</button>
          <h2>Create Account</h2>
          <p className="modal-sub">Sign up with your Google account — free, no credit card needed.</p>
          <div ref={btnRef} className="google-btn-container" />
          {!gsiReady && <p className="modal-loading">Loading Google sign-in…</p>}
          {error && <p className="modal-error">{error}</p>}
          <p className="modal-toggle">
            Already have an account?
            <button type="button" onClick={() => onToggle('login')}>Log in</button>
          </p>
        </div>
      </div>
    );
  }

  // ── Login: email/username + password OR Google ─────────────
  return (
    <div className="modal-backdrop" onClick={e => e.target === e.currentTarget && onClose()}>
      <div className="modal-box">
        <button type="button" className="modal-close" onClick={onClose}>×</button>
        <h2>Welcome back</h2>
        <p className="modal-sub">Log in to your Linx dashboard.</p>

        <form onSubmit={handleLogin}>
          <div className="field">
            <label>Email or Username</label>
            <input type="text" placeholder="you@gmail.com or yourname" value={emailOrUsername} onChange={e => setEmailOrUsername(e.target.value)} autoFocus />
          </div>
          <div className="field">
            <label>Password</label>
            <div style={{ position: 'relative', display: 'flex', alignItems: 'center' }}>
              <input type={showPassword ? 'text' : 'password'} placeholder="Your password" value={password} onChange={e => setPassword(e.target.value)} style={{ flex: 1, paddingRight: '2.5rem' }} />
              <button type="button" onClick={() => setShowPassword(p => !p)} style={{ position: 'absolute', right: '0.7rem', background: 'none', border: 'none', cursor: 'pointer', fontSize: '1.1rem', color: 'var(--muted)' }}>
                {showPassword ? '🙈' : '👁️'}
              </button>
            </div>
          </div>
          {error && <p className="modal-error">{error}</p>}
          <button type="submit" className="btn btn-primary modal-submit">Log in →</button>
        </form>

        <div className="modal-divider"><span>or</span></div>
        <div ref={btnRef} className="google-btn-container" />
        {!gsiReady && <p className="modal-loading">Loading Google sign-in…</p>}

        <p className="modal-toggle">
          Don't have an account?
          <button type="button" onClick={() => onToggle('signup')}>Sign up</button>
        </p>
      </div>
    </div>
  );
}
