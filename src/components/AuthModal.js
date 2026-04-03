import { useState, useEffect, useRef, useCallback } from 'react';
import { login, googleAuth } from '../store';
import './AuthModal.css';

const GOOGLE_CLIENT_ID = process.env.REACT_APP_GOOGLE_CLIENT_ID;
let gsiInitialized = false;

export default function AuthModal({ mode, onClose, onToggle, onAuth }) {
  const [emailOrUsername, setEmailOrUsername] = useState('');
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState('');
  const [googleCredential, setGoogleCredential] = useState(null);
  const [googleEmail, setGoogleEmail] = useState('');
  const [googleStep, setGoogleStep] = useState(false);
  const [loading, setLoading] = useState(false);
  const btnRef = useRef(null);
  const callbackRef = useRef(null);

  useEffect(() => {
    setError(''); setEmailOrUsername(''); setUsername(''); setPassword('');
    setGoogleStep(false); setGoogleCredential(null); setGoogleEmail('');
  }, [mode]);

  const handleGoogleResponse = useCallback(async (response) => {
    setError('');
    setLoading(true);
    const result = await googleAuth({ credential: response.credential });
    setLoading(false);
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

  useEffect(() => { callbackRef.current = handleGoogleResponse; }, [handleGoogleResponse]);

  useEffect(() => {
    if (!GOOGLE_CLIENT_ID || googleStep) return;

    function renderBtn() {
      if (!window.google || !btnRef.current) return;
      if (!gsiInitialized) {
        window.google.accounts.id.initialize({
          client_id: GOOGLE_CLIENT_ID,
          callback: (r) => callbackRef.current(r),
        });
        gsiInitialized = true;
      }
      btnRef.current.innerHTML = '';
      window.google.accounts.id.renderButton(btnRef.current, {
        theme: 'outline',
        size: 'large',
        width: 352,
        text: mode === 'signup' ? 'signup_with' : 'signin_with',
        shape: 'rectangular',
      });
    }

    if (window.google) { renderBtn(); return; }

    if (!document.getElementById('google-gsi')) {
      const script = document.createElement('script');
      script.id = 'google-gsi';
      script.src = 'https://accounts.google.com/gsi/client';
      script.async = true;
      script.onload = renderBtn;
      document.body.appendChild(script);
    } else {
      document.getElementById('google-gsi').addEventListener('load', renderBtn);
    }
  }, [mode, googleStep]);

  async function handleGoogleSetup(e) {
    e.preventDefault();
    setError('');
    if (!username.trim()) { setError('Username is required.'); return; }
    if (password.length < 8) { setError('Password must be at least 8 characters.'); return; }
    setLoading(true);
    const result = await googleAuth({ credential: googleCredential, password, username });
    setLoading(false);
    if (result.error) { setError(result.error); return; }
    onAuth(result.user);
    onClose();
  }

  async function handleLogin(e) {
    e.preventDefault();
    setError('');
    if (!emailOrUsername.trim() || !password.trim()) { setError('All fields are required.'); return; }
    setLoading(true);
    const result = await login({ emailOrUsername, password });
    setLoading(false);
    if (result.error) { setError(result.error); return; }
    onAuth(result.user);
    onClose();
  }

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
            <button type="submit" className="btn btn-primary modal-submit" disabled={loading}>
              {loading ? 'Creating…' : 'Create my Linx →'}
            </button>
          </form>
        </div>
      </div>
    );
  }

  if (mode === 'signup') {
    return (
      <div className="modal-backdrop" onClick={e => e.target === e.currentTarget && onClose()}>
        <div className="modal-box">
          <button type="button" className="modal-close" onClick={onClose}>×</button>
          <h2>Create Account</h2>
          <p className="modal-sub">Sign up with your Google account — free, no credit card needed.</p>
          <div ref={btnRef} className="google-btn-container" />
          {loading && <p className="modal-loading">Please wait…</p>}
          {error && <p className="modal-error">{error}</p>}
          <p className="modal-toggle">
            Already have an account?
            <button type="button" onClick={() => onToggle('login')}>Log in</button>
          </p>
        </div>
      </div>
    );
  }

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
          <button type="submit" className="btn btn-primary modal-submit" disabled={loading}>
            {loading ? 'Logging in…' : 'Log in →'}
          </button>
        </form>
        <div className="modal-divider"><span>or</span></div>
        <div ref={btnRef} className="google-btn-container" />
        {loading && <p className="modal-loading">Please wait…</p>}
        <p className="modal-toggle">
          Don't have an account?
          <button type="button" onClick={() => onToggle('signup')}>Sign up</button>
        </p>
      </div>
    </div>
  );
}
