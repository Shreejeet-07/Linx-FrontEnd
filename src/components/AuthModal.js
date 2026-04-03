import { useState } from 'react';
import { login, googleAuth } from '../store';
import './AuthModal.css';

const GOOGLE_CLIENT_ID = process.env.REACT_APP_GOOGLE_CLIENT_ID;

function GoogleIcon() {
  return (
    <svg width="18" height="18" viewBox="0 0 48 48">
      <path fill="#EA4335" d="M24 9.5c3.54 0 6.71 1.22 9.21 3.6l6.85-6.85C35.9 2.38 30.47 0 24 0 14.62 0 6.51 5.38 2.56 13.22l7.98 6.19C12.43 13.08 17.74 9.5 24 9.5z"/>
      <path fill="#4285F4" d="M46.98 24.55c0-1.57-.15-3.09-.38-4.55H24v9.02h12.94c-.58 2.96-2.26 5.48-4.78 7.18l7.73 6c4.51-4.18 7.09-10.36 7.09-17.65z"/>
      <path fill="#FBBC05" d="M10.53 28.59c-.48-1.45-.76-2.99-.76-4.59s.27-3.14.76-4.59l-7.98-6.19C.92 16.46 0 20.12 0 24c0 3.88.92 7.54 2.56 10.78l7.97-6.19z"/>
      <path fill="#34A853" d="M24 48c6.48 0 11.93-2.13 15.89-5.81l-7.73-6c-2.18 1.48-4.97 2.31-8.16 2.31-6.26 0-11.57-3.59-13.46-8.91l-7.98 6.19C6.51 42.62 14.62 48 24 48z"/>
    </svg>
  );
}

export default function AuthModal({ mode, onClose, onToggle, onAuth }) {
  const [emailOrUsername, setEmailOrUsername] = useState('');
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState('');
  const [googleCode, setGoogleCode] = useState(null);
  const [googleEmail, setGoogleEmail] = useState('');
  const [googleStep, setGoogleStep] = useState(false);
  const [loading, setLoading] = useState(false);

  function openGooglePopup() {
    const params = new URLSearchParams({
      client_id: GOOGLE_CLIENT_ID,
      redirect_uri: window.location.origin,
      response_type: 'code',
      scope: 'openid email profile',
      prompt: 'select_account',
      access_type: 'offline',
    });

    const url = `https://accounts.google.com/o/oauth2/v2/auth?${params}`;
    const w = 500, h = 600;
    const left = window.screenX + (window.outerWidth - w) / 2;
    const top = window.screenY + (window.outerHeight - h) / 2;
    const popup = window.open(url, 'google-auth', `width=${w},height=${h},left=${left},top=${top}`);

    const timer = setInterval(async () => {
      try {
        if (!popup || popup.closed) { clearInterval(timer); return; }
        const popupUrl = popup.location.href;
        if (!popupUrl.includes(window.location.origin)) return;

        clearInterval(timer);
        const code = new URL(popupUrl).searchParams.get('code');
        popup.close();

        if (!code) { setError('Google sign-in cancelled.'); return; }

        setLoading(true);
        setError('');
        const result = await googleAuth({ code });
        setLoading(false);

        if (result.error) { setError(result.error); return; }
        if (result.newUser) {
          setGoogleCode(code);
          setGoogleEmail(result.email);
          setGoogleStep(true);
          return;
        }
        onAuth(result.user);
        onClose();
      } catch { /* cross-origin, still on Google's page */ }
    }, 300);
  }

  async function handleGoogleSetup(e) {
    e.preventDefault();
    setError('');
    if (!username.trim()) { setError('Username is required.'); return; }
    if (password.length < 8) { setError('Password must be at least 8 characters.'); return; }
    setLoading(true);
    const result = await googleAuth({ code: googleCode, password, username });
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
            <button type="submit" className="btn btn-primary modal-submit" disabled={loading}>
              {loading ? 'Creating…' : 'Create my Linx →'}
            </button>
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
          <button type="button" className="btn-google-custom" onClick={openGooglePopup} disabled={loading}>
            <GoogleIcon /> {loading ? 'Signing up…' : 'Sign up with Google'}
          </button>
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
          <button type="submit" className="btn btn-primary modal-submit" disabled={loading}>
            {loading ? 'Logging in…' : 'Log in →'}
          </button>
        </form>
        <div className="modal-divider"><span>or</span></div>
        <button type="button" className="btn-google-custom" onClick={openGooglePopup} disabled={loading}>
          <GoogleIcon /> {loading ? 'Signing in…' : 'Sign in with Google'}
        </button>
        <p className="modal-toggle">
          Don't have an account?
          <button type="button" onClick={() => onToggle('signup')}>Sign up</button>
        </p>
      </div>
    </div>
  );
}
